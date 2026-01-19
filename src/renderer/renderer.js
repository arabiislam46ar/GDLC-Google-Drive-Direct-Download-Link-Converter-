document.addEventListener('DOMContentLoaded', () => {
  const driveLinkInput = document.getElementById('driveLink');
  const convertBtn = document.getElementById('convertBtn');
  const loadingSection = document.getElementById('loadingSection');
  const resultSection = document.getElementById('resultSection');
  const directLinkInput = document.getElementById('directLink');
  const copyBtn = document.getElementById('copyBtn');
  const downloadLink = document.getElementById('downloadLink');
  const newConversionBtn = document.getElementById('newConversionBtn');
  const errorSection = document.getElementById('errorSection');
  const errorMessage = document.getElementById('errorMessage');
  
  convertBtn.addEventListener('click', handleConversion);
  
  driveLinkInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleConversion();
    }
  });
  
  newConversionBtn.addEventListener('click', resetForm);
  
  copyBtn.addEventListener('click', async () => {
    const directLink = directLinkInput.value;
    if (directLink) {
      await window.electronAPI.copyToClipboard(directLink);
      
      copyBtn.textContent = 'Copied!';
      copyBtn.style.backgroundColor = '#2e8b47';
      
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.style.backgroundColor = '#34a853';
      }, 2000);
    }
  });
  
  async function handleConversion() {
    const driveLink = driveLinkInput.value.trim();
    
    if (!driveLink) {
      showError('Please enter a Google Drive link');
      return;
    }
    
    if (!isValidGoogleDriveLink(driveLink)) {
      showError('Please enter a valid Google Drive link');
      return;
    }
    
    setLoadingState(true);
    hideError();
    
    try {
      const result = await window.electronAPI.convertLink(driveLink);
      
      if (result.success) {
        showResult(result.directLink);
      } else {
        showError(result.error);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      showError('An error occurred while converting the link');
    } finally {
      setLoadingState(false);
    }
  }
  
  function isValidGoogleDriveLink(url) {
    return url.includes('drive.google.com') && 
          (url.includes('/d/') || url.includes('id=') || url.includes('/file/d/'));
  }
  
  function setLoadingState(isLoading) {
    if (isLoading) {
      convertBtn.disabled = true;
      loadingSection.style.display = 'block';
      resultSection.style.display = 'none';
    } else {
      convertBtn.disabled = false;
      loadingSection.style.display = 'none';
    }
  }
  
  function showResult(directLink) {
    directLinkInput.value = directLink;
    downloadLink.href = directLink;
    resultSection.style.display = 'block';
    errorSection.style.display = 'none';
  }
  
  function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    resultSection.style.display = 'none';
    loadingSection.style.display = 'none';
  }
  
  function hideError() {
    errorSection.style.display = 'none';
  }
  
  function resetForm() {
    driveLinkInput.value = '';
    driveLinkInput.focus();
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
  }
  
  driveLinkInput.addEventListener('paste', (event) => {
    setTimeout(() => {
      const pastedText = driveLinkInput.value.trim();
      if (isValidGoogleDriveLink(pastedText)) {
        handleConversion();
      }
    }, 100);
  });
  
  driveLinkInput.focus();
});