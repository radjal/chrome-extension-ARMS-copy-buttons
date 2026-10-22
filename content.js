function createCopyButton(targetElement, getValueFn, id=null) {
  // Prevent duplicate buttons
  if (targetElement.nextSibling && targetElement.nextSibling.classList?.contains('copy-btn')) return;

  const button = document.createElement('button');
  button.setAttribute('type', 'button'); // Prevent form reloads
  button.innerText = '📋';
  button.className = 'copy-btn';
  button.style.marginLeft = '5px';
  button.title = 'Copy value';

    // Check if the ID is specifically null or physically null/empty
  if (id === null || !id) {
    // Generate a random string (e.g., a7b2c)
    id = '' + Math.random().toString(36).substr(2, 9);
    
    console.log(`Assigned random value to id: ${id}`);
  }
  button.id = `copybtn-${id}`;

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

  console.log(targetElement.id, id); 

  // Insert after the target element
  if (targetElement.nextSibling) {
    targetElement.parentNode.insertBefore(button, targetElement.nextSibling);
  } else {
    targetElement.parentNode.appendChild(button);
  }
}

function initExtension() {
  let id = '';

  // 1. Original PO Numbers
  id = null;
  document.querySelectorAll(`span[id^="poNumber"]`).forEach(span => { // for Saleforces reference number in rental extension list view, do not set button ID
    createCopyButton(span, () => span.innerText, id); //should be null
    console.log('PO number');
  });

  // 2. Reservation Number
  id = 'reservationNumber';
  const resSpan = document.getElementById(id);
  if (resSpan) createCopyButton(resSpan, () => resSpan.innerText, id);

  // 3. Mobile Number
  id = 'renterPhone1Number';
  const mobileSpan = document.getElementById(id);
  if (mobileSpan) createCopyButton(mobileSpan, () => mobileSpan.innerText, id);

  // 4. ENTERPRISE RENT-A-CAR Location
  id = 'rentalLocationAddtl';
  const locSpan = document.getElementById(id);
  if (locSpan) createCopyButton(locSpan, () => locSpan.innerText, id);

  // 5. Rental Agreement Number - FIX: Changed .value to .innerText for SPAN
  id = 'ticketNumber';
  const raSpan = document.getElementById(id);
  if (raSpan) createCopyButton(raSpan, () => raSpan.innerText, id);

  // 6. Customer VIN # - FIX: Search for the value in the adjacent cell or by pattern
  id = 'vin';
  const vinLabel = Array.from(document.querySelectorAll('b')).find(b => b.innerText.includes('Customer VIN #'));
  if (vinLabel) {
      createCopyButton(vinLabel, () => {
          const parentTd = vinLabel.closest('td');
          if (!parentTd) return "";


          console.log('VIN'); 


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
              if (inputMatch) {
                return inputMatch.value ;
               } else {
                alert('Not a VIN') ;
                return ;
               }

              const tdMatch = Array.from(row.querySelectorAll('td')).find(td => vinPattern.test(td.innerText));
              if (tdMatch) return tdMatch.innerText.trim();
          }
          
          return ;
      }, id);
  }
 
  
  // 7. Branch Number
  id = 'rentalLocationPhone'; 
  const rlSpan = document.getElementById(id);
  if (rlSpan) createCopyButton(rlSpan, () => rlSpan.innerText, id);


  // 8. Registration Number
  id = 'vehicleRegistrationNumber';
  const regValue = document.getElementById(id);
  if (regValue) createCopyButton(regValue, () => regValue.value, id);

}

// Run on load and observe changes
initExtension();
const observer = new MutationObserver(() => initExtension());
observer.observe(document.body, { childList: true, subtree: true });
