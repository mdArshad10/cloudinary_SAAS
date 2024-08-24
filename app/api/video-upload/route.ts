import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { useAuth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { userId } = useAuth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "unauthenticated ",
        },
        { status: 401 }
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET_KEY
    ) {
      return NextResponse.json(
        { error: "invalid cloudinary credentials" },
        { status: 401 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;
    if (!file) {
      return NextResponse.json({ error: "file not found" }, { status: 400 });
    }

    // for uploading any file into the cloudinary
    // we follow the 3 steps blow
    // 1. file have arrayBuffer properties that give us byte
    // 2. convert that byte into a buffer
    // 3. in upload into the upload Stream and end the stream

    const byte = await file.arrayBuffer();
    const buffer = Buffer.from(byte);
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, rejects) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "video-upload",
            transformation: [{ quality: "auto", fetch_format: "mp4" }],
          },
          (error, result) => {
            if (error) rejects(error);
            resolve(result as CloudinaryUploadResult);
          }
        );

        uploadStream.end(buffer);
      }
    );

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize,
        compressedSize: String(result.bytes),
        duration: result.duration || 0,
      },
    });

    return NextResponse.json({ video }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "video upload error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
