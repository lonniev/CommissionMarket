/**
 * Las lecciones, en español: lo que CommissionMarket enseña a un cliente o a
 * un profesional que llega por primera vez. Una oración por línea. Una lección
 * puede llevar una cita, nunca más.
 *
 * Traducido de `src/content/en/lessons.ts`: solo cambian los valores de texto.
 * Las claves, el orden de las listas y cuántos elementos tiene cada lista son los mismos.
 * Los títulos de los libros, los autores y los nombres de los sitios externos están en `src/lib/lessons.ts`.
 */

import type { LessonsText } from "../../lib/lessons.ts";

export const lessons: LessonsText = {
  lessons: {
    "sats-and-lightning": {
      title: "Los sats y Lightning",
      lines: [
        "Un sat es la unidad más pequeña de bitcoin: la cienmillonésima parte de una moneda.",
        "Lightning mueve sats de una billetera a otra en uno o dos segundos, por una fracción de céntimo.",
        "Todos los precios de CommissionMarket están en sats, y cada pago es una factura Lightning."
      ],
      more: [
        "Bitcoin es un dinero que ningún gobierno emite y que ningún banco puede congelar.",
        "Su oferta está fijada por norma en veintiún millones de monedas, de modo que nadie puede imprimir más para pagar sus cuentas.",
        "Lightning es una red de canales de pago construida sobre Bitcoin, pensada para pagos pequeños y frecuentes.",
        "Una factura Lightning indica un importe exacto y vence si nadie la paga a tiempo.",
        "Cuando el cliente paga la factura del profesional, los sats llegan a la billetera del propio profesional.",
        "CommissionMarket nunca guarda el dinero, así que aquí no hay ningún saldo que pueda perderse, embargarse o usarse indebidamente.",
        "Junto a cada precio se muestra, como referencia, su valor en su propia moneda al cambio de hoy."
      ],
      saying: {
        text: "El problema de fondo de la moneda convencional es toda la confianza que se necesita para que funcione.",
        from: "Satoshi Nakamoto, 2009"
      },
      tryThis: "Pida a su billetera una factura Lightning de 1.000 sats, y lea el importe y el vencimiento que muestra.",
      ask: "¿Qué cambia para usted que el pago por su trabajo llegue en un segundo en lugar de en treinta días?"
    },
    "your-keys-your-wallet": {
      title: "Sus claves, su billetera",
      lines: [
        "Una billetera Lightning guarda las claves que controlan sus sats.",
        "Elija una billetera en la que usted mismo guarde las claves, y conserve sus palabras de respaldo en un lugar seguro.",
        "Un profesional necesita una billetera que pueda recibir, y un cliente, una que pueda pagar."
      ],
      more: [
        "Una clave es un número secreto muy largo, y quien lo conoce puede gastar los sats que controla.",
        "La mayoría de las billeteras muestran la clave como doce o veinticuatro palabras de respaldo al configurarlas por primera vez.",
        "Escriba las palabras en papel y guarde el papel donde guarda sus documentos importantes.",
        "Nunca las escriba en un sitio web, nunca les haga una foto y nunca se las envíe a nadie.",
        "Una billetera custodiada guarda las claves por usted, lo cual es cómodo y le exige confiar en la empresa que la ofrece.",
        "Una billetera de autocustodia deja las claves solo en sus manos, y es la opción sensata para los ingresos que usted gana.",
        "Una dirección Lightning, como nombre@billetera.example, permite que un cliente le pague sin pedirle una factura cada vez.",
        "Puede guardar una en su Perfil aquí."
      ],
      saying: {
        text: "Si no son tus claves, no son tus monedas.",
        from: "Un dicho entre bitcoiners"
      },
      tryThis: "Busque dónde muestra su billetera las palabras de respaldo, y compruebe que su copia escrita coincide con ellas.",
      ask: "Si mañana perdiera el teléfono, ¿podría restaurar su billetera con lo que tiene anotado?"
    },
    "your-npub-and-signing": {
      title: "Su npub y su firma",
      lines: [
        "En CommissionMarket se le conoce por su npub, la mitad pública de una clave de Nostr.",
        "La mitad privada, su nsec, firma aquello con lo que usted está de acuerdo.",
        "Cualquiera puede comprobar una firma con su npub, y nadie puede falsificarla sin su nsec."
      ],
      more: [
        "Nostr es un protocolo abierto de mensajería, y una clave de Nostr funciona con cualquier aplicación de Nostr.",
        "Puede compartir su npub sin riesgo: es como los clientes le invitan y como los profesionales encuentran sus encargos.",
        "Su nsec debe permanecer en secreto, porque quien la tenga puede firmar en su nombre.",
        "Para iniciar sesión, usted aprueba desde su cliente de Nostr un mensaje enviado a su npub.",
        "Para firmar una oferta, usted responde al mensaje directo que le envía Task Booth, y su respuesta lleva su firma.",
        "Una firma abarca el texto exacto de la oferta mediante su sha256, de modo que no puede trasladarse a otra oferta.",
        "Ni CommissionMarket ni Task Booth le piden nunca su nsec."
      ],
      saying: {
        text: "Que vuestro sí sea sí, y vuestro no, no.",
        from: "Santiago 5:12"
      },
      tryThis: "Abra su cliente de Nostr y busque su npub; luego compare sus ocho primeros caracteres con los que aparecen en su Perfil aquí.",
      links: ["Una introducción sencilla a Nostr: claves, clientes y relés."],
      ask: "¿Quién podría actuar hoy en su nombre, y cómo lo sabría usted?"
    },
    "the-signed-offer": {
      title: "La oferta firmada",
      lines: [
        "Un encargo se convierte en un acuerdo cuando el cliente y el profesional firman la misma oferta.",
        "La oferta es una declaración sencilla de todas las condiciones, con su sha256.",
        "El cliente firma primero, y el profesional firma antes de entregar."
      ],
      more: [
        "La oferta indica la descripción general, las calificaciones y lo que otorga cada una, el anticipo, los hitos y el día límite.",
        "También incluye la portada: los entregables, las especificaciones y su sha256, la aceptación tácita, la propiedad intelectual, la confidencialidad y la ley aplicable.",
        "Todo lo que no figura en la portada se rige por las Condiciones generales, identificadas por su versión y su sha256.",
        "El sha256 es una huella del texto: si cambia un solo carácter, la huella cambia por completo.",
        "Así, cuando ambas firmas abarcan la misma huella, ambas partes acordaron exactamente las mismas palabras.",
        "Si el cliente modifica el encargo, la oferta cambia y el cliente vuelve a firmar.",
        "Un profesional invitado solo puede aceptar un encargo después de que el cliente lo haya firmado.",
        "Lea la oferta antes de firmarla, como haría con cualquier contrato."
      ],
      saying: {
        text: "No es de la benevolencia del carnicero, del cervecero o del panadero de donde esperamos nuestra cena, sino de la atención que prestan a su propio interés.",
        from: "Adam Smith, La riqueza de las naciones (1776)"
      },
      tryThis: "Abra las Condiciones generales y lea la sección sobre los entregables antes de publicar o aceptar su próximo encargo.",
      ask: "¿Qué condición de su último acuerdo querría tener por escrito si surgiera un desacuerdo?"
    },
    "deposits-and-milestones": {
      title: "Anticipos e hitos",
      lines: [
        "Un profesional puede cobrar a medida que avanza el trabajo.",
        "El anticipo se paga cuando se acepta el encargo, y cada hito en su fecha.",
        "En conjunto pueden sumar como máximo el 90% del precio, y la calificación liquida el resto."
      ],
      more: [
        "El cliente elige el anticipo y los hitos al publicar, cada uno como parte del precio de la calificación más alta.",
        "Un hito tiene un nombre, una fecha de vencimiento igual o anterior al día límite, y su parte.",
        "Para cada pago, Task Booth genera una factura Lightning por el importe exacto, pagadera al profesional.",
        "Cuando el profesional tiene una dirección Lightning en su Perfil, la factura se genera a partir de ella.",
        "En caso contrario, el profesional entrega una factura generada en su propia billetera.",
        "El cliente paga desde su propia billetera, y el profesional confirma cuando llegan los sats.",
        "Al final, la remuneración es lo que otorga la calificación menos todo lo ya pagado por adelantado.",
        "Si la calificación otorga menos de lo pagado por adelantado, no se debe nada más, y el sitio no reclama ninguna devolución."
      ],
      saying: {
        text: "En su día le darás su jornal, y no se pondrá el sol sin que se lo hayas dado.",
        from: "Deuteronomio 24:15"
      },
      tryThis: "Tome un trabajo que conozca bien y divida su precio en un anticipo y dos hitos que reflejen cómo se desarrolla realmente el trabajo.",
      ask: "¿Cuánto riesgo asume cada uno de ustedes antes de que se mueva el primer sat, y cómo lo cambiaría un anticipo?"
    },
    "delivery-and-grading": {
      title: "Entrega, calificación y aceptación tácita",
      lines: [
        "El profesional entrega el trabajo y marca el encargo como entregado.",
        "Después, el cliente lo califica con una de las calificaciones de la oferta.",
        "Si el cliente no califica dentro de los días acordados, el trabajo se considera aceptado con la calificación acordada."
      ],
      more: [
        "Las calificaciones se nombran de antemano, como Aceptado, Aceptado con cambios y No aceptado, cada una con sus sats.",
        "Nombrarlas desde el principio permite que ambas partes sepan cuánto vale cada resultado antes de empezar el trabajo.",
        "Entregue lo que enumera la portada, en la forma que describen las especificaciones.",
        "Si el trabajo se retrasa, se aplica la regla de retraso de la oferta: pago íntegro, una parte menos por día, tramos de descuento en plazos fijados, o el cierre del encargo como incumplido.",
        "El trabajo que siga sin entregar en el punto de incumplimiento de la portada pone fin al encargo, y el profesional puede alegar causa dentro del plazo para apelar.",
        "La aceptación tácita protege al profesional frente a un cliente que nunca responde.",
        "La portada fija su calificación y su plazo, de 1 a 60 días.",
        "Una vez calificado, se debe la remuneración menos lo pagado por adelantado, y se paga mediante factura Lightning como cualquier otro pago."
      ],
      saying: {
        text: "¿Has visto a un hombre diligente en su trabajo? Delante de los reyes estará.",
        from: "Proverbios 22:29"
      },
      tryThis: "Redacte las calificaciones de un encargo que tenga en mente, cada una con una frase que diga exactamente qué la merece.",
      ask: "¿Qué necesitaría ver en una entrega para darle la calificación más alta sin dudarlo?"
    },
    "who-owns-the-work": {
      title: "A quién pertenece el trabajo",
      lines: [
        "La portada indica a quién pertenece lo que hace el profesional.",
        "Puede cederse al cliente, licenciarse al cliente, conservarlo el profesional o regirse por las palabras que ustedes mismos redacten.",
        "Decídanlo antes de empezar el trabajo, porque forma parte de lo que se compra."
      ],
      more: [
        "Cedido significa que, con el pago, el cliente es titular pleno del trabajo y de sus derechos.",
        "Licenciado significa que el profesional conserva la titularidad y concede al cliente el derecho a usarlo.",
        "Conservado por el profesional significa que el cliente recibe los entregables y el profesional conserva todos los derechos.",
        "Las condiciones personalizadas les permiten redactar exactamente lo que acuerden, como derechos para un solo uso o una sola región.",
        "Un retrato para la pared de una biblioteca, un logotipo para una empresa y un estudio para uso privado requieren cada uno algo distinto.",
        "La elección suele influir en el precio: ser titular pleno vale más para un cliente que una licencia.",
        "La portada indica también si la descripción y el trabajo son confidenciales, y si se permiten subcontratistas."
      ],
      tryThis: "Para su próximo encargo, decida cuál de las cuatro opciones le conviene antes de fijar un precio.",
      ask: "¿Qué querrá hacer con este trabajo dentro de diez años, y se lo permite el acuerdo?"
    },
    "when-you-disagree": {
      title: "Cuando no están de acuerdo",
      lines: [
        "Un profesional que no está de acuerdo con una calificación puede apelarla una vez, con sus motivos.",
        "El árbitro nombrado en la portada lee ambas partes y decide, o quien desempata cuando no hay árbitro.",
        "Un cliente que no recibió nada puede rechazar la entrega en lugar de calificarla."
      ],
      more: [
        "La mayoría de los desacuerdos se resuelven antes con un mensaje directo que con una apelación, así que hablen primero.",
        "Una apelación se presenta dentro del plazo para apelar que fija la portada, e indica qué debe examinar el árbitro.",
        "El registro ya contiene la oferta, las calificaciones y el historial.",
        "El árbitro elige una calificación de la misma lista dentro de su plazo para decidir, y esa decisión es definitiva.",
        "La opinión firmada de un inspector sobre el trabajo es un consejo que el árbitro puede tener en cuenta.",
        "Cada paso consta en el historial del encargo, con su hora y con quién lo dio.",
        "Antes de que alguien acepte un encargo, el cliente puede retirarlo.",
        "Después de aceptarlo, el profesional puede renunciar a él, y el encargo vuelve a quedar abierto para el círculo.",
        "La portada indica la ley aplicable y el foro para todo lo que las Condiciones generales no resuelven."
      ],
      saying: {
        text: "Ponte de acuerdo pronto con tu adversario, mientras vas con él por el camino.",
        from: "Mateo 5:25"
      },
      tryThis: "Revise el historial de un encargo en el que participe, y compruebe que cuenta la historia tal como usted la recuerda.",
      ask: "Si este encargo saliera mal, ¿qué querría que pudiera leer el árbitro?"
    },
    "your-standing": {
      title: "Su reputación",
      lines: [
        "Cada npub tiene una reputación, que se lee en los encargos en los que ha participado.",
        "Cuenta cada papel por separado: como cliente, profesional, árbitro e inspector.",
        "Cualquiera puede leerla, así que un cliente puede ver a quién invita, y un profesional, para quién trabaja."
      ],
      more: [
        "Para un profesional, cuenta los encargos entregados, a tiempo y con retraso, los incumplimientos con y sin causa, y las apelaciones ganadas y perdidas.",
        "Para un cliente, cuenta las calificaciones dadas a tiempo, los Saldos pagados y las apelaciones perdidas.",
        "Para un árbitro, cuenta las resoluciones dadas dentro del plazo para decidir; para un inspector, las opiniones dadas.",
        "Un rango lo resume en una palabra: nuevo, irregular, probado, de confianza o ejemplar.",
        "El rango depende de cuántos encargos terminaron y de cuántos salieron bien, según los umbrales que fija el Operador.",
        "Solo cuentan los encargos, así que las tareas y los trabajos de práctica dejan su reputación tal como estaba.",
        "Cada nombre del formulario del encargo muestra su rango al lado, con un enlace al historial completo."
      ],
      saying: {
        text: "De más estima es el buen nombre que las muchas riquezas.",
        from: "Proverbios 22:1"
      },
      tryThis: "Abra su propia página de reputación desde su npub, y léala como la leería un desconocido antes de invitarle.",
      ask: "¿Qué recuento de su historial querría mejorar más en sus próximos tres encargos?"
    },
    "price-and-worth": {
      title: "Precio en sats, valor en su moneda",
      lines: [
        "Cada encargo tiene su precio en sats, y cada pago se hace en sats.",
        "Su valor en su propia moneda se muestra al lado, al cambio de hoy, como referencia.",
        "El precio que usted acuerda es el número de sats, haga lo que haga después el tipo de cambio."
      ],
      more: [
        "Un precio es la forma en que dos personas que valoran las cosas de manera distinta se ponen de acuerdo en un intercambio.",
        "El cliente valora el trabajo terminado más que los sats, y el profesional valora los sats más que las horas: por eso ambos dicen que sí.",
        "Fijar el precio en sats mantiene el acuerdo en el dinero que realmente se paga.",
        "A lo largo de un encargo largo, el cambio entre los sats y su moneda variará, en un sentido u otro.",
        "Un anticipo y unos hitos fijan parte del precio en el momento de cada pago.",
        "Elija en su Perfil la moneda que se muestra junto a los precios; cambia solo la referencia, nunca el precio."
      ],
      saying: {
        text: "Debemos considerar el sistema de precios como un mecanismo de comunicación de información si queremos comprender su verdadera función.",
        from: "F. A. Hayek, El uso del conocimiento en la sociedad (1945)"
      },
      tryThis: "Ponga precio a un encargo que aceptaría, primero en su propia moneda y luego en sats, y anote el cambio que utilizó.",
      ask: "¿Qué cree que comprará más el año que viene: mil sats, o lo que valen hoy en su moneda?"
    }
  },
  shelves: {
    money: "Dinero",
    exchange: "Intercambio y empresa",
    free: "Personas libres"
  },
  books: {
    "the-bitcoin-standard": "La historia del dinero, y por qué importa una oferta fija.",
    "mastering-the-lightning-network": "Cómo funcionan los pagos Lightning, de los canales a las facturas.",
    "history-of-money-and-banking-in-the-united-states": "Cómo el dinero estadounidense pasó del oro al papel, contado por el hombre de nuestro retrato de ejemplo.",
    "economics-in-one-lesson": "Mirar más allá de hoy, a lo que una decisión produce después y a todos los que alcanza.",
    "man-economy-and-state": "El tratado completo de Rothbard sobre el intercambio, los precios y la producción.",
    "human-action": "Mises sobre por qué las personas actúan, comercian y planifican, y lo que les dicen los precios.",
    "principles-of-economics": "La obra fundacional de Menger sobre el valor: el valor reside en la persona que valora.",
    "choice-cooperation-enterprise-and-human-action": "La acción humana, contada de nuevo para el lector de hoy.",
    "the-sovereign-individual": "Lo que les ocurre al trabajo y a los ingresos cuando se trasladan a internet y cruzan fronteras.",
    "the-road-to-serfdom": "Por qué las economías planificadas acaban en menos libertad.",
    "the-church-and-the-market": "Una defensa católica de la economía libre.",
    "the-network-state": "Cómo las comunidades que nacen en internet pueden convertirse en algo más."
  }
};
