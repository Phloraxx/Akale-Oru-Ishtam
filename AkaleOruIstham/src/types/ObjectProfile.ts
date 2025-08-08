export interface ObjectProfile {
  id: string;
  name: string;
  bio: string;
  passions: string[];
  prompt: {
    question: string;
    answer: string;
  };
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    description: string;
  };
  vibe: string;
  createdAt: Date;
  createdBy: string;
}

// For camera capture flow
export interface CaptureData {
  imageUri: string;
  name: string;
  vibe: string;
  location: {
    latitude: number;
    longitude: number;
    description: string;
  };
}
