/**
 * Les leçons, en français : ce que CommissionMarket enseigne à un client ou à
 * un prestataire qui le découvre. Une phrase par ligne. Une leçon porte au plus
 * une citation.
 *
 * Seules les valeurs sont traduites depuis `src/content/en/lessons.ts`.
 * Les clés, l'ordre des listes et le nombre d'éléments restent ceux de l'anglais.
 * Les titres des livres, les auteurs et les noms des sites extérieurs sont dans `src/lib/lessons.ts`.
 */

import type { LessonsText } from "../../lib/lessons.ts";

export const lessons: LessonsText = {
  lessons: {
    "sats-and-lightning": {
      title: "Les sats et Lightning",
      lines: [
        "Un sat est la plus petite unité du bitcoin : un cent-millionième de bitcoin.",
        "Lightning fait passer des sats d'un portefeuille à un autre en une ou deux secondes, pour une fraction de centime.",
        "Chaque prix sur CommissionMarket est en sats, et chaque paiement est une facture Lightning."
      ],
      more: [
        "Le bitcoin est une monnaie qu'aucun gouvernement n'émet et qu'aucune banque ne peut geler.",
        "Son offre est fixée par une règle à vingt et un millions de bitcoins : personne ne peut en imprimer davantage pour payer ses dettes.",
        "Lightning est un réseau de canaux de paiement construit sur Bitcoin, conçu pour les paiements petits et fréquents.",
        "Une facture Lightning indique un montant exact, et elle expire si personne ne la paie à temps.",
        "Quand le client paie la facture du prestataire, les sats arrivent dans le portefeuille du prestataire lui-même.",
        "CommissionMarket ne détient jamais l'argent : il n'y a donc ici aucun solde qui puisse être perdu, saisi ou détourné.",
        "À côté de chaque prix, tu vois sa valeur dans ta propre devise au cours du jour, à titre indicatif."
      ],
      saying: {
        text: "Le problème fondamental de la monnaie conventionnelle, c'est toute la confiance qu'il faut pour qu'elle fonctionne.",
        from: "Satoshi Nakamoto, 2009"
      },
      tryThis: "Demande à ton portefeuille une facture Lightning de 1 000 sats, et lis le montant et l'expiration qu'elle affiche.",
      ask: "Qu'est-ce que cela change pour toi quand le paiement de ton travail arrive en une seconde plutôt qu'en trente jours ?"
    },
    "your-keys-your-wallet": {
      title: "Tes clés, ton portefeuille",
      lines: [
        "Un portefeuille Lightning contient les clés qui contrôlent tes sats.",
        "Choisis un portefeuille dont tu détiens toi-même les clés, et garde ses mots de sauvegarde en lieu sûr.",
        "Un prestataire a besoin d'un portefeuille capable de recevoir, et un client d'un portefeuille capable de payer."
      ],
      more: [
        "Une clé est un nombre secret très long, et quiconque le connaît peut dépenser les sats qu'il contrôle.",
        "La plupart des portefeuilles présentent la clé sous la forme de douze ou vingt-quatre mots de sauvegarde lors de leur création.",
        "Écris ces mots sur papier et range ce papier là où tu gardes tes documents importants.",
        "Ne les saisis jamais sur un site web, ne les photographie jamais et ne les envoie jamais à personne.",
        "Un portefeuille dépositaire détient les clés pour toi : c'est pratique, et cela suppose de faire confiance à l'entreprise qui le gère.",
        "Un portefeuille en auto-garde laisse les clés à toi seul : c'est le choix sensé pour les revenus que tu gagnes.",
        "Une adresse Lightning, comme name@wallet.example, permet à un client de te payer sans te demander une facture à chaque fois.",
        "Tu peux en enregistrer une dans ton Profil ici."
      ],
      saying: {
        text: "Pas tes clés, pas tes bitcoins.",
        from: "Un dicton chez les bitcoiners"
      },
      tryThis: "Trouve où ton portefeuille affiche ses mots de sauvegarde, et vérifie que ta copie écrite leur correspond.",
      ask: "Si tu perdais ton téléphone demain, pourrais-tu restaurer ton portefeuille à partir de ce que tu as noté ?"
    },
    "your-npub-and-signing": {
      title: "Ton npub et ta signature",
      lines: [
        "Sur CommissionMarket, tu es connu par ton npub, la moitié publique d'une clé Nostr.",
        "La moitié privée, ton nsec, signe ce que tu acceptes.",
        "Chacun peut vérifier une signature à partir de ton npub, et personne ne peut la falsifier sans ton nsec."
      ],
      more: [
        "Nostr est un protocole ouvert de messagerie, et une clé Nostr fonctionne avec n'importe quelle application Nostr.",
        "Tu peux partager ton npub sans risque : c'est par lui que les clients t'invitent et que les prestataires trouvent tes commandes.",
        "Ton nsec doit rester secret, car quiconque le détient peut signer en ton nom.",
        "Pour te connecter, tu approuves depuis ton client Nostr un message envoyé à ton npub.",
        "Pour signer une offre, tu réponds au message privé que Task Booth t'envoie, et ta réponse porte ta signature.",
        "Une signature couvre le texte exact de l'offre par son sha256 : elle ne peut donc pas être déplacée vers une autre offre.",
        "Ni CommissionMarket ni Task Booth ne te demandent jamais ton nsec."
      ],
      saying: {
        text: "Que votre oui soit oui, et votre non, non.",
        from: "Jacques 5:12"
      },
      tryThis: "Ouvre ton client Nostr et trouve ton npub, puis compare ses huit premiers caractères avec celui affiché dans ton Profil ici.",
      links: ["Une introduction simple à Nostr : les clés, les clients et les relais."],
      ask: "Qui pourrait agir en ton nom aujourd'hui, et comment le saurais-tu ?"
    },
    "the-signed-offer": {
      title: "L'offre signée",
      lines: [
        "Une commande devient un accord quand le client et le prestataire signent la même offre.",
        "L'offre est un énoncé simple de toutes les conditions, accompagné de son sha256.",
        "Le client signe en premier, et le prestataire signe avant de livrer."
      ],
      more: [
        "L'offre indique le cahier des charges, les appréciations et ce que chacune rapporte, l'acompte, les jalons et la date attendue.",
        "Elle comporte aussi la page de garde : les livrables, la spécification et son sha256, l'acceptation tacite, la propriété intellectuelle, la confidentialité et le droit applicable.",
        "Tout ce qui ne figure pas sur la page de garde suit les Conditions générales, désignées par leur version et leur sha256.",
        "Le sha256 est une empreinte du texte : change un seul caractère, et l'empreinte change entièrement.",
        "Ainsi, quand les deux signatures couvrent la même empreinte, les deux parties ont accepté exactement les mêmes mots.",
        "Si le client modifie la commande, l'offre change et le client signe à nouveau.",
        "Un prestataire invité ne peut prendre en charge une commande qu'après que le client l'a signée.",
        "Lis l'offre avant de la signer, comme tu le ferais pour tout contrat."
      ],
      saying: {
        text: "Ce n'est pas de la bienveillance du boucher, du brasseur ou du boulanger que nous attendons notre dîner, mais du soin qu'ils apportent à leur propre intérêt.",
        from: "Adam Smith, La Richesse des nations (1776)"
      },
      tryThis: "Ouvre les Conditions générales et lis la section sur les livrables avant de publier ou de prendre en charge ta prochaine commande.",
      ask: "Quelle condition de ton dernier accord aurais-tu le plus voulu voir écrite en cas de désaccord ?"
    },
    "deposits-and-milestones": {
      title: "Acomptes et jalons",
      lines: [
        "Un prestataire peut être payé au fil du travail.",
        "Un acompte est payé lors de la prise en charge de la commande, et chaque jalon à sa date.",
        "Ensemble, ils peuvent atteindre au plus 90 % du prix, et l'appréciation règle le reste."
      ],
      more: [
        "Le client choisit l'acompte et les jalons en publiant la commande, chacun comme une part du prix de l'appréciation la plus haute.",
        "Un jalon a un nom, une échéance au plus tard à la date attendue, et sa part.",
        "Pour chaque paiement, Task Booth établit une facture Lightning du montant exact, payable au prestataire.",
        "Quand le prestataire a une adresse Lightning dans son Profil, la facture est établie à partir de celle-ci.",
        "Sinon, le prestataire remet une facture issue de son propre portefeuille.",
        "Le client paie depuis son propre portefeuille, et le prestataire confirme quand les sats arrivent.",
        "À la fin, la rémunération est ce que rapporte l'appréciation, moins tout ce qui a déjà été payé d'avance.",
        "Si l'appréciation rapporte moins que ce qui a été payé d'avance, plus rien n'est dû, et le site ne reprend rien."
      ],
      saying: {
        text: "Le jour même, tu lui donneras son salaire, avant que le soleil ne se couche.",
        from: "Deutéronome 24:15"
      },
      tryThis: "Prends un travail que tu connais bien et divise son prix en un acompte et deux jalons qui suivent le déroulement réel du travail.",
      ask: "Quel risque chacun de vous porte-t-il avant que les premiers sats ne circulent, et comment un acompte changerait-il cela ?"
    },
    "delivery-and-grading": {
      title: "Livraison, appréciation et acceptation tacite",
      lines: [
        "Le prestataire livre le travail et marque la commande comme livrée.",
        "Le client lui donne alors l'une des appréciations prévues dans l'offre.",
        "Si le client ne donne pas d'appréciation dans le délai convenu, le travail est réputé accepté à l'appréciation convenue."
      ],
      more: [
        "Les appréciations sont nommées à l'avance, comme Accepté, Accepté avec modifications et Non accepté, chacune avec ses sats.",
        "Les nommer dès le départ permet aux deux parties de savoir ce que vaut chaque issue avant que le travail ne commence.",
        "Livre ce que la page de garde énumère, sous la forme que décrit la spécification.",
        "Si le travail est en retard, la règle de retard de l'offre s'applique : paiement en totalité, une part retirée par jour, des paliers à des moments fixés, ou commande close comme manquée.",
        "Un travail toujours en attente de livraison au point de défaut indiqué sur la page de garde met fin à la commande, et le prestataire peut invoquer un motif dans le délai de contestation.",
        "L'acceptation tacite protège le prestataire d'un client qui ne répond jamais.",
        "La page de garde fixe son appréciation et son délai, de 1 à 60 jours.",
        "Une fois l'appréciation donnée, la rémunération, moins ce qui a été payé d'avance, est due et réglée par facture Lightning, comme tout autre paiement."
      ],
      saying: {
        text: "Vois-tu un homme diligent dans son ouvrage ? Il se tiendra devant les rois.",
        from: "Proverbes 22:29"
      },
      tryThis: "Rédige les appréciations d'une commande que tu as en tête, chacune avec une phrase qui dit exactement ce qui la mérite.",
      ask: "Que te faudrait-il voir dans une livraison pour lui donner l'appréciation la plus haute sans hésiter ?"
    },
    "who-owns-the-work": {
      title: "À qui appartient le travail",
      lines: [
        "La page de garde indique à qui appartient ce que le prestataire réalise.",
        "Le travail peut être cédé au client, concédé sous licence au client, conservé par le prestataire, ou régi par vos propres termes.",
        "Règle cette question avant que le travail ne commence, car elle fait partie de ce qui est acheté."
      ],
      more: [
        "Cédé signifie qu'au paiement, le client possède pleinement le travail et ses droits.",
        "Concédé sous licence signifie que le prestataire reste propriétaire et accorde au client le droit de l'utiliser.",
        "Conservé par le prestataire signifie que le client reçoit les livrables et que le prestataire garde tous les droits.",
        "Des conditions personnalisées vous permettent d'écrire exactement ce que vous convenez tous les deux, par exemple des droits pour un seul usage ou une seule région.",
        "Un portrait pour le mur d'une bibliothèque, un logo pour une entreprise et une étude à usage privé appellent chacun un choix différent.",
        "Le choix influe en général sur le prix : posséder pleinement le travail vaut plus pour un client qu'une licence.",
        "La page de garde indique aussi si le cahier des charges et le travail sont confidentiels, et si la sous-traitance est autorisée."
      ],
      tryThis: "Pour ta prochaine commande, décide lequel des quatre choix convient avant de fixer un prix.",
      ask: "Que voudras-tu faire de ce travail dans dix ans, et l'accord te le permet-il ?"
    },
    "when-you-disagree": {
      title: "En cas de désaccord",
      lines: [
        "Un prestataire en désaccord avec une appréciation peut la contester une fois, motifs à l'appui.",
        "L'arbitre désigné sur la page de garde examine les deux points de vue et tranche, ou le départageur quand il n'y a pas d'arbitre.",
        "Un client qui n'a rien reçu peut refuser la livraison au lieu de lui donner une appréciation."
      ],
      more: [
        "La plupart des désaccords se règlent plus vite par un message privé que par une contestation : parlez-vous d'abord.",
        "Une contestation arrive dans le délai de contestation fixé sur la page de garde, et indique ce que l'arbitre doit examiner.",
        "Le dossier contient déjà l'offre, les appréciations et l'historique.",
        "L'arbitre choisit une appréciation dans la même liste, dans le délai de décision, et sa décision est définitive.",
        "L'avis signé d'un inspecteur sur le travail est un conseil dont l'arbitre peut tenir compte.",
        "Chaque étape figure dans l'historique de la commande, avec son heure et son auteur.",
        "Tant que personne n'a pris la commande en charge, le client peut la retirer.",
        "Après l'avoir prise en charge, le prestataire peut y renoncer, et la commande s'ouvre de nouveau au cercle.",
        "La page de garde indique le droit applicable et la juridiction pour tout ce que les Conditions générales laissent ouvert."
      ],
      saying: {
        text: "Accorde-toi promptement avec ton adversaire, tandis que tu es en chemin avec lui.",
        from: "Matthieu 5:25"
      },
      tryThis: "Consulte l'historique d'une commande à laquelle tu participes, et vérifie qu'il raconte les faits comme tu t'en souviens.",
      ask: "Si cette commande tournait mal, que voudrais-tu que l'arbitre puisse lire ?"
    },
    "your-standing": {
      title: "Ta réputation",
      lines: [
        "Chaque npub a une réputation, tirée des commandes auxquelles elle a pris part.",
        "Elle compte chaque rôle à part : client, prestataire, arbitre et inspecteur.",
        "Tout le monde peut la lire : un client voit ainsi qui il invite, et un prestataire pour qui il travaille."
      ],
      more: [
        "Pour un prestataire, elle compte les commandes livrées, à temps et en retard, les défauts avec et sans motif, et les contestations gagnées et perdues.",
        "Pour un client, elle compte les appréciations données à temps, les Soldes payés et les contestations perdues.",
        "Pour un arbitre, elle compte les décisions rendues dans le délai de décision ; pour un inspecteur, les avis donnés.",
        "Un rang la résume en un mot : nouveau, inégal, confirmé, fiable ou exemplaire.",
        "Le rang dépend du nombre de commandes terminées et de celles qui se sont bien passées, selon des seuils que fixe l'Opérateur.",
        "Seules les commandes comptent : les tâches ménagères et les travaux d'entraînement laissent ta réputation telle qu'elle était.",
        "Chaque nom sur le formulaire de commande affiche son rang à côté, avec un lien vers le dossier complet."
      ],
      saying: {
        text: "La réputation est préférable à de grandes richesses.",
        from: "Proverbes 22:1"
      },
      tryThis: "Ouvre ta propre page de réputation depuis ton npub, et lis-la comme le ferait un inconnu avant de t'inviter.",
      ask: "Quel chiffre de ton dossier aimerais-tu le plus améliorer au cours de tes trois prochaines commandes ?"
    },
    "price-and-worth": {
      title: "Le prix en sats, la valeur dans ta devise",
      lines: [
        "Chaque commande a un prix en sats, et chaque paiement se fait en sats.",
        "Sa valeur dans ta propre devise est affichée à côté au cours du jour, à titre indicatif.",
        "Le prix convenu est le nombre de sats, quelle que soit l'évolution du taux de change ensuite."
      ],
      more: [
        "Un prix est la manière dont deux personnes qui attribuent aux choses une valeur différente s'accordent sur un échange.",
        "Le client tient davantage au travail achevé qu'aux sats, et le prestataire davantage aux sats qu'à ses heures : c'est pourquoi tous deux disent oui.",
        "Fixer le prix en sats maintient l'accord dans la monnaie réellement payée.",
        "Sur une longue commande, le taux entre les sats et ta devise évoluera, dans un sens ou dans l'autre.",
        "Un acompte et des jalons fixent une partie du prix au moment de chaque paiement.",
        "Choisis dans ton Profil la devise affichée à côté des prix ; elle ne change que la référence, jamais le prix."
      ],
      saying: {
        text: "Nous devons considérer le système des prix comme un tel mécanisme de communication de l'information si nous voulons comprendre sa véritable fonction.",
        from: "F. A. Hayek, L'utilisation de l'information dans la société (1945)"
      },
      tryThis: "Fixe le prix d'une commande que tu accepterais, d'abord dans ta propre devise, puis en sats, et note le taux que tu as utilisé.",
      ask: "Lequel penses-tu pouvoir acheter davantage l'an prochain : mille sats, ou ce qu'ils valent aujourd'hui dans ta devise ?"
    }
  },
  shelves: {
    money: "La monnaie",
    exchange: "L'échange et l'entreprise",
    free: "Des personnes libres"
  },
  books: {
    "the-bitcoin-standard": "L'histoire de la monnaie, et pourquoi une offre fixe compte.",
    "mastering-the-lightning-network": "Le fonctionnement des paiements Lightning, des canaux aux factures.",
    "history-of-money-and-banking-in-the-united-states": "Comment la monnaie américaine est passée de l'or au papier, racontée par l'homme de notre portrait d'exemple.",
    "economics-in-one-lesson": "Regarder au-delà d'aujourd'hui, vers ce qu'un choix produit plus tard, et vers tous ceux qu'il touche.",
    "man-economy-and-state": "Le traité complet de Rothbard sur l'échange, les prix et la production.",
    "human-action": "Mises sur les raisons pour lesquelles les gens agissent, échangent et planifient, et sur ce que les prix leur apprennent.",
    "principles-of-economics": "L'œuvre fondatrice de Menger sur la valeur : la valeur réside dans la personne qui estime.",
    "choice-cooperation-enterprise-and-human-action": "L'Action humaine, racontée de nouveau pour le lecteur d'aujourd'hui.",
    "the-sovereign-individual": "Ce que deviennent le travail et le revenu quand ils passent en ligne et franchissent les frontières.",
    "the-road-to-serfdom": "Pourquoi les économies planifiées aboutissent à moins de liberté.",
    "the-church-and-the-market": "Un plaidoyer catholique pour l'économie libre.",
    "the-network-state": "Comment des communautés nées en ligne peuvent devenir bien davantage."
  }
};
