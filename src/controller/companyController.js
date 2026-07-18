import { getAdsLandingPage } from '../service/companyService.js';

export const seeAllAds = async (req, res) => {
    try {
        const result = await getAdsLandingPage();
        res.status(200).json({
            message: 'Berhasil Ambil Data Kategori Untuk Landing Page',
            result,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
