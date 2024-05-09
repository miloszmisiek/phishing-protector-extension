export const spinner = `<div class="loadersmall"></div>`;
export const shieldCheck = `<svg
xmlns="http://www.w3.org/2000/svg"
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
class="lucide lucide-shield-check"
>
<path
  d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
/>
<path d="m9 12 2 2 4-4" />
</svg>`;
export const shieldX = `<svg
xmlns="http://www.w3.org/2000/svg"
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
class="lucide lucide-shield-x"
>
<path
  d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
/>
<path d="m14.5 9.5-5 5" />
<path d="m9.5 9.5 5 5" />
</svg>`;
export const infoIcon = `<svg
xmlns="http://www.w3.org/2000/svg"
width="24"
height="24"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
class="lucide lucide-info"
>
<circle cx="12" cy="12" r="10" />
<path d="M12 16v-4" />
<path d="M12 8h.01" />
</svg>`;
export const deleteIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" 
  width="18" 
  height="18" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  stroke-width="2" 
  stroke-linecap="round" 
  stroke-linejoin="round" 
  class="lucide lucide-trash-2"
  >
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" x2="10" y1="11" y2="17"/>
    <line x1="14" x2="14" y1="11" y2="17"/>
  </svg>
  `;
const modelClassificationNote = `
  <p>
    Machine Learning model classify links as
    <span style="color: rgb(11, 175, 112); font-weight: 600">safe</span>,
    <span style="color: rgb(204, 8, 8); font-weight: 600">potentially harmful</span> or
    <span style="color: rgb(245, 158, 11); font-weight: 600">suspicious</span>.
  </p>
`;
export const linksToCheckMessage = `
  ${modelClassificationNote}
  <p> If you trust the source, you can manually classify link with buttons as
    <span style="color: rgb(11, 175, 112); font-weight: 600">safe</span>
      or otherwise as
    <span style="color: rgb(204, 8, 8); font-weight: 600">phishing</span>.
  </p>
`;
export const noLinksMessage = "<p>No links to check</p>";

export const itemsPerPage = 5;