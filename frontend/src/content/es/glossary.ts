/**
 * Las palabras que usa CommissionMarket, y lo que significan, en español.
 *
 * Traducido de `src/content/en/glossary.ts`: las claves son las mismas.
 * "npub", "nsec", "sha256" y "api_sats" conservan su nombre; `aka` recoge lo
 * que un lector en español buscaría.
 */

import type { GlossaryText } from "../../lib/glossary.ts";

export const glossary: GlossaryText = {
  groups: {
    people: "Quién participa",
    agreement: "El acuerdo",
    schedule: "Plazos",
    money: "Dinero",
    identity: "Claves y firmas",
    standing: "Reputación",
    filing: "Dónde se archiva el trabajo",
  },
  words: {
    client: {
      term: "Cliente",
      aka: ["comprador", "mecenas", "patrocinador"],
      said: "Quien encarga el trabajo, fija sus condiciones, califica la entrega y paga.",
    },
    professional: {
      term: "Profesional",
      aka: ["artista", "trabajador", "ejecutante", "artesano"],
      said: "Quien se compromete a hacer el trabajo: acepta un encargo, firma su oferta, hace el trabajo y lo entrega.",
    },
    arbiter: {
      term: "Árbitro",
      said: "Alguien en quien ambas partes confían, nombrado en la portada. El árbitro firma la oferta, resuelve una apelación o una alegación de causa, y guarda la tercera llave del depósito en garantía.",
    },
    tie_breaker: {
      term: "Quien desempata",
      aka: ["desempate", "desempatador"],
      said: "La persona que el cliente designa para resolver una apelación cuando el encargo no tiene árbitro.",
    },
    inspector: {
      term: "Inspector",
      aka: ["verificador", "evaluador", "perito"],
      said: "Una persona independiente, nombrada en la portada, que examina el trabajo terminado y firma una opinión sobre él. La opinión es un consejo, y el inspector no guarda ninguna llave del depósito.",
    },
    audience: {
      term: "Profesionales invitados",
      aka: ["invitados", "círculo", "público"],
      said: "Los profesionales que un cliente invita a hacer el trabajo, por npub. Solo ellos ven el encargo y pueden aceptarlo.",
    },
    offer: {
      term: "Oferta",
      aka: ["oferta firmada", "declaración"],
      said: "Una declaración sencilla de todas las condiciones de un encargo. El cliente, el profesional y, si los hay, el árbitro y el inspector firman cada uno la misma declaración.",
    },
    claim: {
      term: "Aceptar un encargo",
      aka: ["aceptar", "asumir", "reclamar"],
      said: "El paso con que un profesional asume el trabajo de un encargo. Cuando él y el cliente firman la misma oferta, queda obligado a hacer el trabajo según lo especificado.",
    },
    cover_page: {
      term: "Portada",
      aka: ["datos particulares", "particulares"],
      said: "Los datos particulares de un encargo conforme a las Condiciones generales: los entregables, las personas, los plazos, el depósito en garantía y las opciones legales.",
    },
    standard_terms: {
      term: "Condiciones generales",
      aka: ["términos y condiciones", "contrato"],
      said: "El contrato conforme al cual se hace cada encargo, que se lee en la página de las Condiciones generales. La portada completa sus datos particulares.",
    },
    deliverable: {
      term: "Entregable",
      aka: ["entregables", "entrega"],
      said: "Cada cosa que entrega el profesional, una por línea en la portada.",
    },
    spec_link: {
      term: "Especificaciones",
      aka: ["especificación", "pliego", "descripción"],
      said: "Un enlace a la descripción completa del trabajo, para todo lo que no quepa en la descripción general.",
    },
    spec_hash: {
      term: "sha256 de las especificaciones",
      aka: ["hash de las especificaciones", "huella"],
      said: "La huella del archivo de especificaciones, para que ambas partes puedan mostrar que el archivo que firmaron es el del enlace.",
    },
    grade: {
      term: "Calificación",
      aka: ["nota", "valoración"],
      said: "Un nivel con el que puede juzgarse el trabajo, con lo que otorga en sats. El cliente califica la entrega, y la calificación más alta es el precio.",
    },
    rubric: {
      term: "Calificaciones",
      aka: ["rúbrica", "baremo", "criterios"],
      said: "La lista de calificaciones, cada una con sus sats y con lo que la merece.",
    },
    ip_terms: {
      term: "Propiedad intelectual",
      aka: ["PI", "titularidad", "derechos de autor", "licencia"],
      said: "A quién pertenece el trabajo terminado y qué puede hacer cada parte con él, según se elija en la portada.",
    },
    governing_law: {
      term: "Ley aplicable",
      aka: ["ley", "foro", "jurisdicción"],
      said: "La ley conforme a la cual se interpreta el acuerdo, y el foro donde se ve una disputa.",
    },
    needed_by: {
      term: "Día límite",
      aka: ["fecha límite", "fecha de entrega", "plazo"],
      said: "El día para el que el cliente necesita la entrega.",
    },
    late_terms: {
      term: "Si el trabajo se retrasa",
      aka: ["tramos de retraso", "retraso", "descuento"],
      said: "Lo que obtiene una entrega tardía: su calificación íntegra, una parte menos por cada día, tramos de descuento en plazos fijados, o el cierre del encargo como incumplido.",
    },
    failure_point: {
      term: "Incumplimiento de entrega",
      aka: ["punto de incumplimiento", "incumplido"],
      said: "El momento, después del día límite, en que termina un encargo sin entregar. Sin causa, el depósito en garantía y el trabajo entregado son del cliente.",
    },
    deemed_acceptance: {
      term: "Aceptación tácita",
      aka: ["calificación tácita", "calificación por defecto", "silencio"],
      said: "Una entrega que queda sin calificar durante los días acordados cuenta como calificada con la calificación tácita. Así el silencio no retiene los sats.",
    },
    appeal_window: {
      term: "Plazo para apelar",
      aka: ["plazo de apelación"],
      said: "El tiempo que tiene el profesional, tras una calificación, para apelarla, y tras un incumplimiento, para alegar causa. Se acuerda en la portada.",
    },
    ruling_time: {
      term: "Plazo del árbitro para decidir",
      aka: ["plazo para resolver", "plazo de resolución"],
      said: "El tiempo que tiene el árbitro, o quien desempata, para resolver una apelación o una alegación de causa. Se acuerda en la portada.",
    },
    payment_window: {
      term: "Plazo para pagar",
      aka: ["plazo de pago"],
      said: "El tiempo que tiene el cliente para pagar una vez fijada la calificación. Se acuerda en la portada.",
    },
    deposit: {
      term: "Anticipo",
      aka: ["anticipo al aceptarse", "adelanto", "señal"],
      said: "Una parte del precio de la calificación más alta, pagada al profesional cuando se acepta el encargo.",
    },
    milestone: {
      term: "Hito",
      aka: ["etapa", "plazo", "entrega parcial"],
      said: "Una parte del precio de la calificación más alta que vence en su propia fecha mientras avanza el trabajo.",
    },
    paid_ahead: {
      term: "Pagado por adelantado",
      aka: ["pago adelantado"],
      said: "El anticipo y los hitos en conjunto, como máximo el 90% del precio. La calificación liquida el resto.",
    },
    balance: {
      term: "Saldo",
      aka: ["remuneración", "liquidación"],
      said: "Lo que otorga la calificación, menos el anticipo y los hitos ya pagados. El cliente lo paga mediante factura Lightning.",
    },
    escrow: {
      term: "Depósito en garantía",
      aka: ["depósito", "escrow", "custodia"],
      said: "El precio de la calificación más alta menos lo pagado por adelantado, guardado en un mint de Cashu y bloqueado con las llaves del cliente, del profesional y del árbitro. Dos cualesquiera de ellos lo liberan, en partes.",
    },
    mint: {
      term: "Mint",
      aka: ["Cashu", "ecash", "efectivo electrónico"],
      said: "El servicio de Cashu que guarda los sats de un depósito en garantía como ecash bloqueado con las tres llaves.",
    },
    refund_after: {
      term: "Reembolso tras",
      aka: ["días de reembolso", "bloqueo temporal"],
      said: "Los días después del día límite a partir de los cuales solo el cliente puede recuperar el depósito en garantía.",
    },
    sat: {
      term: "sat",
      aka: ["sats", "satoshi"],
      said: "La unidad más pequeña de bitcoin: 100.000.000 sats forman un bitcoin. Todos los precios de aquí están en sats.",
    },
    bitcoin: {
      term: "Bitcoin",
      said: "Un dinero de oferta fija que ningún gobierno emite y que ningún banco controla.",
    },
    lightning: {
      term: "Lightning",
      said: "Una red de pagos construida sobre Bitcoin para pagos rápidos y pequeños. Los encargos se pagan por ella.",
    },
    invoice: {
      term: "Factura",
      aka: ["factura Lightning", "solicitud de pago"],
      said: "Una solicitud Lightning de pago por un número exacto de sats, con vencimiento.",
    },
    lightning_address: {
      term: "Dirección Lightning",
      said: "Una dirección como nombre@billetera.example que genera una factura nueva para cada pago.",
    },
    api_sats: {
      term: "api_sats",
      aka: ["tarifas de herramientas", "crédito de Tollbooth"],
      said: "El crédito de tu billetera de Tollbooth que paga la pequeña tarifa de cada herramienta de Task Booth. Es independiente de lo que paga un encargo.",
    },
    npub: {
      term: "npub",
      aka: ["clave pública", "Nostr"],
      said: "Tu clave pública de Nostr: el nombre por el que se te conoce, se te invita y con el que inicias sesión.",
    },
    nsec: {
      term: "nsec",
      aka: ["clave secreta", "clave privada"],
      said: "Tu clave secreta de Nostr. Firma en tu nombre, así que permanece en tus propias manos.",
    },
    signature: {
      term: "Firma",
      aka: ["firmar", "firmado"],
      said: "La marca de tu clave de Nostr sobre una declaración, que prueba que aceptaste exactamente esas palabras. Cada firma se pide y se da en un mensaje directo.",
    },
    sha256: {
      term: "sha256",
      aka: ["hash", "huella"],
      said: "Una huella de un texto o de un archivo: cualquier cambio en él cambia la huella.",
    },
    reputation: {
      term: "Reputación",
      aka: ["historial", "trayectoria", "prestigio"],
      said: "Lo que una npub ha hecho en los encargos en cada papel que ha tenido: como cliente, profesional, árbitro e inspector. Cualquiera puede leerla.",
    },
    rank: {
      term: "Rango",
      aka: ["nuevo", "irregular", "probado", "de confianza", "ejemplar"],
      said: "Una palabra que resume una reputación: nuevo, irregular, probado, de confianza o ejemplar, según cuántos encargos terminaron y cuántos salieron bien. El Operador fija dónde empieza cada rango.",
    },
    claim_of_cause: {
      term: "Alegación de causa",
      aka: ["causa", "justificación", "excusa"],
      said: "Los motivos del profesional por los que el trabajo nunca se entregó, enviados dentro del plazo para apelar. El árbitro la acepta o la rechaza, y un incumplimiento con causa cuenta de otra manera.",
    },
    organization: {
      term: "Organización",
      aka: ["org"],
      said: "Un grupo que reúne Proyectos. Sus miembros ven cada Proyecto y pueden publicar encargos en ellos.",
    },
    project: {
      term: "Proyecto",
      said: "Donde se archiva un conjunto de encargos, con un presupuesto y condiciones por defecto. Cada encargo nuevo se archiva en uno.",
    },
    project_defaults: {
      term: "Condiciones por defecto",
      aka: ["valores por defecto", "plantilla"],
      said: "Las condiciones con las que empieza un encargo nuevo en un Proyecto. Después, cada encargo conserva las suyas.",
    },
  },
};
