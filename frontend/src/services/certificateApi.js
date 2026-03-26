import { axiosJWT } from '../config/axiosJWT';

export const getCertificateByParticipant = async (participantId) => {
    const response = await axiosJWT.get(`/api/certificates/participant/${participantId}`);
    return response.data;
};
