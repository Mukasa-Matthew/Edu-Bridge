const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/IT9sUhjwsSDLdTDfBSxTGk'

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_COMMUNITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our WhatsApp community"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#1ebf5c] focus:outline-none focus:ring-2 focus:ring-[#25D366]/60 focus:ring-offset-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.37c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.85 1.06-.16.18-.31.2-.58.07-.27-.14-1.12-.41-2.13-1.3-.79-.7-1.33-1.57-1.48-1.84-.16-.27-.02-.42.12-.56.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.45-.61-.46h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27s.97 2.63 1.11 2.81c.14.18 1.9 2.9 4.6 4.06.64.28 1.14.44 1.53.56.64.2 1.22.17 1.68.1.51-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.06-.11-.25-.18-.52-.31z" />
        <path d="M16.04 3C8.84 3 3 8.83 3 16.03c0 2.31.6 4.56 1.75 6.54L3 29l6.62-1.73c1.93 1.05 4.11 1.6 6.42 1.6h.01c7.2 0 13.03-5.83 13.03-13.03S23.24 3 16.04 3zm0 23.73h-.01c-1.95 0-3.86-.53-5.53-1.53l-.4-.24-3.93 1.03 1.05-3.83-.26-.39a10.93 10.93 0 0 1-1.69-5.74C5.27 9.84 10 5.13 16.04 5.13c6.03 0 10.75 4.71 10.75 10.9 0 6.05-4.73 10.7-10.75 10.7z" />
      </svg>
    </a>
  )
}
