const WHATSAPP_NUMBER = '51920614965'
const DEFAULT_MESSAGE = 'Hola, tengo una consulta sobre FarmaTalent.'

export function WhatsAppFloatButton({ message = DEFAULT_MESSAGE }) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float-btn"
      aria-label="Escríbenos por WhatsApp"
      title="¿Dudas? Escríbenos por WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.6 6.32A8.86 8.86 0 0 0 11.94 4C7.13 4 3.2 7.93 3.2 12.74c0 1.62.44 3.13 1.2 4.43L3 21l3.96-1.36a8.7 8.7 0 0 0 4.97 1.5c4.8 0 8.74-3.93 8.74-8.74a8.86 8.86 0 0 0-2.31-5.92zm-5.66 13.5a7.24 7.24 0 0 1-4.05-1.23l-.29-.18-2.78.96.95-2.66-.2-.3a7.22 7.22 0 0 1-1.27-4.07c0-4 3.27-7.27 7.3-7.27 1.94 0 3.77.76 5.14 2.14a7.2 7.2 0 0 1 2.13 5.14c0 4.02-3.27 7.27-7.3 7.27zm4-5.46c-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11-.14.22-.57.72-.7.87-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.1-.65-.58-1.09-1.3-1.22-1.52-.13-.22-.01-.34.11-.45.11-.11.25-.29.37-.43.12-.14.16-.25.24-.41.08-.16.04-.3-.03-.42-.07-.11-.6-1.43-.82-1.95-.22-.52-.44-.45-.6-.46-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.71.32-.25.25-.95.93-.95 2.26 0 1.33.97 2.62 1.1 2.8.13.18 1.83 2.8 4.46 3.81 2.63 1.02 2.63.68 3.1.64.48-.04 1.55-.63 1.77-1.24.22-.61.22-1.13.15-1.24-.07-.11-.25-.18-.48-.29z"/>
      </svg>
    </a>
  )
}
