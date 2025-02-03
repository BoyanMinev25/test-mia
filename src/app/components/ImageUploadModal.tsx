async function handleUpload() {
  try {
    // ... upload logic ...
  } catch (error) {
    Logger.error('Upload failed:', error)
    setErrorMessage(
      error instanceof Error ? error.message : 'Failed to upload image'
    )
  }
} 