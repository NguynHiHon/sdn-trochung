import { axiosJWT } from '../config/axiosJWT';
import { axiosPublic } from '../config/axiosPublic';

export const getCertificateByParticipant = async (participantId) => {
    const response = await axiosJWT.get(`/api/certificates/participant/${participantId}`);
    return response.data;
};

export const getCertificateByCodePublic = async (certificateCode) => {
    const code = String(certificateCode || '').trim();
    const response = await axiosPublic.get(`/api/certificates/code/${encodeURIComponent(code)}`);
    return response.data;
};
