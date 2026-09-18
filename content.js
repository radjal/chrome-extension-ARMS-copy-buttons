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

  // 2. Reservation Number
  const resSpan = document.getElementById('reservationNumber');
  if (resSpan) createCopyButton(resSpan, () => resSpan.innerText);

  // 3. Mobile Number
  const mobileSpan = document.getElementById('renterPhone1Number');
  if (mobileSpan) createCopyButton(mobileSpan, () => mobileSpan.innerText);

  // 4. ENTERPRISE RENT-A-CAR Location
  const locSpan = document.getElementById('eracLocation');
  if (locSpan) createCopyButton(locSpan, () => locSpan.innerText);

  // 5. Rental Agreement Number - FIX: Changed .value to .innerText for SPAN
  const raSpan = document.getElementById('ticketNumber');
  if (raSpan) createCopyButton(raSpan, () => raSpan.innerText);

  // 6. Customer VIN # - FIX: Search for the value in the adjacent cell or by pattern
  const vinLabel = Array.from(document.querySelectorAll('b')).find(b => b.innerText.includes('Customer VIN #'));
  if (vinLabel) {
      createCopyButton(vinLabel, () => {
          const parentTd = vinLabel.closest('td');
          if (!parentTd) return "";

          // 1. Look for input in the next cell (The specific structure we found)
          const nextTd = parentTd.nextElementSibling;
          const nextTdInput = nextTd ? nextTd.querySelector('input') : null;
          if (nextTdInput && nextTdInput.value) return nextTdInput.value;

          // 2. Check for input in the same cell (fallback)
          const sameTdInput = parentTd.querySelector('input');
          if (sameTdInput && sameTdInput.value) return sameTdInput.value;

          // 3. Fallback: Check text content of next cell
          if (nextTd && nextTd.innerText.trim()) return nextTd.innerText.trim();

          // 4. Final Fallback: Search the entire row for a VIN pattern
          const row = parentTd.closest('tr');
          const vinPattern = /[A-HJ-NPR-Z0-9]{17}/;
          if (row) {
              const allInputs = Array.from(row.querySelectorAll('input'));
              const inputMatch = allInputs.find(i => vinPattern.test(i.value));
              if (inputMatch) return inputMatch.value;

              const tdMatch = Array.from(row.querySelectorAll('td')).find(td => vinPattern.test(td.innerText));
              if (tdMatch) return tdMatch.innerText.trim();
          }
          
          return "";
      });
  }
}

// Run on load and observe changes
initExtension();
const observer = new MutationObserver(() => initExtension());
observer.observe(document.body, { childList: true, subtree: true });