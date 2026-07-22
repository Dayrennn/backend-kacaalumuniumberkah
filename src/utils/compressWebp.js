import sharp from 'sharp';

export default async function compressToWebp(buffer) {
    const compressedBuffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer(); // return Buffer, bukan tulis ke disk

    return compressedBuffer;
}
