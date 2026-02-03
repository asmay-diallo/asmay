import {api} from './api'
export const uploadAPI = {
  uploadProfilePicture: async (imageUri: string) => {
    const formData = new FormData();
    
    // Créer un objet fichier à partir de l'URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      type: type,
      name: filename || 'profile.jpg',
    } as any);

    const response = await api.post('/uploads/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
