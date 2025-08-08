export interface ObjectProfile {
  id: string;
  name: string;
  age: string;
  bio: string;
  anthem: {
    title: string;
    artist: string;
  };
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

export interface ObjectCreationData {
  objectName: string;
  location: {
    latitude: number;
    longitude: number;
    description: string;
  };
  vibe: string;
  imageUri: string;
}

export interface SwipeAction {
  id: string;
  userId: string;
  objectId: string;
  direction: 'left' | 'right';
  createdAt: Date;
}
