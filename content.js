function createCopyButton(targetElement, getValueFn) {
  // Prevent duplicate buttons
  if (targetElement.nextSibling && targetElement.nextSibling.classList?.contains('copy-btn')) return;

  const button = document.createElement('button');
  button.setAttribute('type', 'button'); // Prevent form reloads
  button.innerText = '📋';
  button.className = 'copy-btn';
  button.style.marginLeft = '5px';
  button.title = 'Copy value';

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const textToCopy = getValueFn().trim();
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = button.innerText;
      button.innerText = '✓';
      button.classList.add('copied');
      setTimeout(() => {
        button.innerText = originalText;
        button.classList.remove('copied');
      }, 2000);
    });
  });

  // Insert after the target element
  if (targetElement.nextSibling) {
    targetElement.parentNode.insertBefore(button, targetElement.nextSibling);
  } else {
    targetElement.parentNode.appendChild(button);
  }
}

function initExtension() {
  // 1. Original PO Numbers
  document.querySelectorAll('span[id^="poNumber"]').forEach(span => {
    createCopyButton(span, () => span.innerText);
  });

  // 2. Reservation Number (Found span#reservationNumber)
  const resSpan = document.getElementById('reservationNumber');
  if (resSpan) createCopyButton(resSpan, () => resSpan.innerText);

  // 3. Mobile Number (Found span#renterPhone1Number)
  const mobileSpan = document.getElementById('renterPhone1Number');
  if (mobileSpan) createCopyButton(mobileSpan, () => mobileSpan.innerText);

  // 4. ENTERPRISE RENT-A-CAR Location (Found span#eracLocation)
  const locSpan = document.getElementById('eracLocation');
  if (locSpan) createCopyButton(locSpan, () => locSpan.innerText);

  // 5. Rental Agreement Number (Found input#sf_ticketNum)
  const raInput = document.getElementById('ticketNumber');
  if (raInput) createCopyButton(raInput, () => raInput.value);

  // 6. Customer VIN # (Special Case: usually a text node in a specific TD or near a label)
  // Based on scan, the VIN label is often in a <b> tag. 
  // We look for the label and then the next text node or input.
  const vinLabel = Array.from(document.querySelectorAll('b')).find(b => b.innerText.includes('Customer VIN #'));
  if (vinLabel && vinLabel.parentElement) {
      // If there's an input nearby for VIN, target it. Otherwise target the label.
      const vinInput = vinLabel.parentElement.querySelector('input');
      if (vinInput) {
          createCopyButton(vinInput, () => vinInput.value);
      } else {
          // If no input, it might be text content in the parent
          createCopyButton(vinLabel, () => vinLabel.parentElement.innerText.replace('Customer VIN #:', ''));
      }
  }
}

// Run on load and observe changes
initExtension();
const observer = new MutationObserver(() => initExtension());
observer.observe(document.body, { childList: true, subtree: true });