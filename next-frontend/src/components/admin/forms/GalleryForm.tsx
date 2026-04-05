// Re-export the new gallery forms for backwards compatibility
// The gallery system now uses CollectionForm for managing gallery collections
// and ImageForm for managing images within collections

export { CollectionForm, type CollectionFormData } from './CollectionForm';
export { ImageForm, type ImageFormData } from './ImageForm';

// Default export for backwards compatibility
export { CollectionForm as default } from './CollectionForm';
