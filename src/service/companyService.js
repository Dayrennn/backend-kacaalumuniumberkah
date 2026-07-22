import prisma from '../config/prisma.js';
import compressToWebp from '../utils/compressWebp.js';
import { deleteFromCloudinary, uploadToCloudinary } from './cloudinaryService.js';

export const getAdsLandingPage = async () => {
    const ads = await prisma.produkAds.findMany({
        include: {
            barang: {
                include: {
                    kategori: true,
                },
            },
        },
    });
    return ads;
};

export const addCompany = async ({ namaPerusahaan, telephone, deskripsiPerusahaan, lokasi, jadwal, email }) => {
    if (!namaPerusahaan) {
        throw new Error('Nama Perusahaan Wajib di Isi');
    }
    if (!telephone && telephone != 0) {
        throw new Error('Nomor Telephone Wajib di Isi');
    }
    if (!deskripsiPerusahaan) {
        throw new Error('Deskripsi Perusahaan Wajib di Isi');
    }
    if (!lokasi) {
        throw new Error('Lokasi Wajib di Isi');
    }
    if (!jadwal) {
        throw new Error('Jadwal Wajib di Isi');
    }
    if (!email) {
        throw new Error('Email Wajib di Isi');
    }

    const profile = await prisma.companyProfile.upsert({
        where: {
            id: 'company-profile',
        },
        update: {
            namaPerusahaan,
            telephone,
            deskripsiPerusahaan,
            lokasi,
            jadwal,
            email,
        },
        create: {
            id: 'company-profile',
            namaPerusahaan,
            telephone,
            deskripsiPerusahaan,
            lokasi,
            jadwal,
            email,
        },
    });

    return profile;
};

export const getCompanyProfile = async () => {
    const result = await prisma.companyProfile.findFirst({
        where: { id: 'company-profile' },
        select: {
            namaPerusahaan: true,
            telephone: true,
            deskripsiPerusahaan: true,
            lokasi: true,
            jadwal: true,
            email: true,
        },
    });

    return result;
};

export const addBanner = async ({ imageBuffer, judul }) => {
    if (!imageBuffer) {
        throw new Error('Gambar wajib di isi');
    }
    if (!judul) {
        throw new Error('Judul wajib di isi');
    }

    // ambil dulu data lama (kalau ada) sebelum di-overwrite, buat tau gambar mana yang harus dihapus
    const existing = await prisma.banner.findUnique({
        where: { id: 'banner-profile' },
        select: { bannerImagePublicId: true },
    });

    // 1. upload gambar baru DULU
    const compressed = await compressToWebp(imageBuffer);
    const uploaded = await uploadToCloudinary(compressed, {
        folder: 'banner',
        publicId: `banner-${Date.now()}`,
    });

    try {
        const newBanner = await prisma.banner.upsert({
            where: { id: 'banner-profile' },
            update: {
                bannerImageUrl: uploaded.url,
                bannerImagePublicId: uploaded.publicId,
                judul,
            },
            create: {
                id: 'banner-profile',
                bannerImageUrl: uploaded.url,
                bannerImagePublicId: uploaded.publicId,
                judul,
            },
        });

        // 2. setelah DB berhasil, BARU hapus gambar lama
        if (existing?.bannerImagePublicId) {
            await deleteFromCloudinary(existing.bannerImagePublicId);
        }

        return newBanner;
    } catch (error) {
        // kalau upsert DB gagal, hapus gambar baru yang terlanjur ke-upload (rollback)
        await deleteFromCloudinary(uploaded.publicId);
        throw error;
    }
};

export const getBanner = async () => {
    const bannerProfile = await prisma.banner.findFirst({
        where: { id: 'banner-profile' },
        select: {
            bannerImageUrl: true,
            judul: true,
        },
    });

    return bannerProfile;
};
