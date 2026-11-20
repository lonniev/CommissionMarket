/**
 * Les mots qu'emploie CommissionMarket, et ce qu'ils signifient, en français.
 * Les clés sont celles de `src/content/en/glossary.ts` ; `aka` liste ce qu'un
 * lecteur francophone chercherait.
 */

import type { GlossaryText } from "../../lib/glossary.ts";

export const glossary: GlossaryText = {
  groups: {
    people: "Qui participe",
    agreement: "L'accord",
    schedule: "Les délais",
    money: "L'argent",
    identity: "Clés et signatures",
    standing: "Réputation",
    filing: "Où le travail est rangé",
  },
  words: {
    client: {
      term: "Client",
      aka: ["acheteur", "commanditaire", "mécène"],
      said: "Celui qui commande le travail, fixe ses conditions, apprécie la livraison et paie.",
    },
    professional: {
      term: "Prestataire",
      aka: ["professionnel", "artiste", "artisan", "travailleur"],
      said: "Celui qui s'engage à faire le travail : il prend en charge une commande, signe son offre, réalise le travail et le livre.",
    },
    arbiter: {
      term: "Arbitre",
      aka: ["médiateur"],
      said: "Une personne en qui les deux parties ont confiance, désignée sur la page de garde. L'arbitre signe l'offre, tranche une contestation ou un motif invoqué, et détient la troisième clé d'un séquestre.",
    },
    tie_breaker: {
      term: "Départageur",
      aka: ["tiers départiteur"],
      said: "Qui tranche une contestation quand la commande n'a pas d'arbitre : le client, ou la personne qu'il désigne. Le prestataire peut demander, et la décision du client règle le paiement.",
    },
    inspector: {
      term: "Inspecteur",
      aka: ["vérificateur", "expert", "évaluateur"],
      said: "Une personne indépendante, désignée sur la page de garde, qui examine le travail fini et signe un avis sur lui. L'avis est un conseil, et l'inspecteur ne détient aucune clé du séquestre.",
    },
    audience: {
      term: "Prestataires invités",
      aka: ["invités", "cercle", "public"],
      said: "Les prestataires qu'un client invite à faire le travail, par npub. Eux seuls voient la commande et peuvent la prendre en charge. Un Projet nomme son cercle pour chaque nouvelle commande.",
    },
    offer: {
      term: "Offre",
      aka: ["offre signée", "énoncé"],
      said: "Un énoncé simple de toutes les conditions d'une commande. Le client, le prestataire, et l'arbitre et l'inspecteur s'il y en a, signent chacun ce même énoncé.",
    },
    claim: {
      term: "Prise en charge",
      aka: ["prendre en charge", "accepter", "s'engager"],
      said: "Le geste par lequel un prestataire se charge du travail d'une commande. Une fois que lui et le client ont signé la même offre, il est tenu de réaliser le travail tel que spécifié.",
    },
    cover_page: {
      term: "Page de garde",
      aka: ["particularités", "conditions particulières"],
      said: "Les particularités d'une commande au titre des Conditions générales : les livrables, les personnes, les délais, le séquestre et les choix juridiques.",
    },
    standard_terms: {
      term: "Conditions générales",
      aka: ["CGV", "conditions", "contrat"],
      said: "Le contrat sous lequel chaque commande est conclue, à lire sur la page des Conditions générales. La page de garde en précise les particularités.",
    },
    deliverable: {
      term: "Livrable",
      aka: ["livrables"],
      said: "Une chose que le prestataire remet, une par ligne sur la page de garde.",
    },
    spec_link: {
      term: "Spécification",
      aka: ["spec", "cahier des charges", "document de conception", "CAO", "exigences", "maquette", "plan"],
      said: "Un lien vers le document de conception que le travail doit respecter, comme des plans, de la CAO, des exigences ou une maquette, sous gestion de versions pour que la version signée reste fixe.",
    },
    spec_hash: {
      term: "sha256 de la spécification",
      aka: ["empreinte", "hash", "condensé"],
      said: "L'empreinte du fichier de spécification, pour que les deux parties puissent montrer que le fichier signé est bien celui du lien.",
    },
    grade: {
      term: "Appréciation",
      aka: ["note", "niveau"],
      said: "Un niveau auquel le travail peut être jugé, avec ce qu'il rapporte en sats. Le client apprécie la livraison, et l'appréciation la plus haute est le prix.",
    },
    rubric: {
      term: "Grille d'appréciation",
      aka: ["appréciations", "critères", "barème"],
      said: "La liste des appréciations, chacune avec ses sats et ce qui la mérite.",
    },
    ip_terms: {
      term: "Propriété intellectuelle",
      aka: ["PI", "droits", "droit d'auteur", "licence"],
      said: "À qui appartient le travail fini et ce que chaque partie peut en faire, choisi sur la page de garde.",
    },
    governing_law: {
      term: "Droit applicable",
      aka: ["droit", "juridiction", "tribunal compétent"],
      said: "Le droit sous lequel l'accord est lu, et la juridiction où un litige est entendu.",
    },
    needed_by: {
      term: "Date attendue",
      aka: ["échéance", "date limite"],
      said: "Le jour où le client a besoin de la livraison.",
    },
    late_terms: {
      term: "En cas de retard",
      aka: ["paliers", "retard", "réduction"],
      said: "Ce que rapporte une livraison en retard : toute son appréciation, une part retirée par jour, des paliers à des moments fixés, ou la clôture de la commande comme manquée.",
    },
    failure_point: {
      term: "Défaut de livraison",
      aka: ["point de défaut", "manquée"],
      said: "Le moment, après la date attendue, où une commande non livrée prend fin. Sans motif, le séquestre et le travail remis reviennent au client.",
    },
    deemed_acceptance: {
      term: "Acceptation tacite",
      aka: ["appréciation tacite", "silence"],
      said: "Une livraison laissée sans appréciation pendant les jours convenus compte comme appréciée à l'appréciation tacite. Ainsi, le silence ne prend pas les sats en otage.",
    },
    appeal_window: {
      term: "Délai de contestation",
      aka: ["délai de recours", "recours"],
      said: "Le temps dont dispose le prestataire pour contester une appréciation, et, après un défaut, pour invoquer un motif. Convenu sur la page de garde.",
    },
    ruling_time: {
      term: "Délai de décision de l'arbitre",
      aka: ["délai de décision"],
      said: "Le temps dont dispose l'arbitre, ou le départageur, pour trancher une contestation ou un motif invoqué. Convenu sur la page de garde.",
    },
    payment_window: {
      term: "Délai de paiement",
      aka: ["paiement"],
      said: "Le temps dont dispose le client pour payer une fois l'appréciation arrêtée. Convenu sur la page de garde.",
    },
    deposit: {
      term: "Acompte",
      aka: ["acompte à la prise en charge", "avance", "arrhes"],
      said: "Une part du prix de l'appréciation la plus haute, payée au prestataire quand sa prise en charge est acceptée.",
    },
    milestone: {
      term: "Jalon",
      aka: ["étape", "échéance", "versement"],
      said: "Une part du prix de l'appréciation la plus haute, due à sa propre date pendant que le travail avance.",
    },
    paid_ahead: {
      term: "Payé d'avance",
      aka: ["avance"],
      said: "L'acompte et les jalons ensemble, au plus 90 % du prix. L'appréciation règle le reste.",
    },
    balance: {
      term: "Solde",
      aka: ["reste dû"],
      said: "Ce que rapporte l'appréciation, moins l'acompte et les jalons déjà payés. Le client le paie par facture Lightning.",
    },
    escrow: {
      term: "Séquestre",
      aka: ["dépôt", "garantie"],
      said: "Le prix de l'appréciation la plus haute moins ce qui a été payé d'avance, détenu dans un mint Cashu et verrouillé aux clés du client, du prestataire et de l'arbitre. Deux d'entre elles suffisent à le libérer, par parts.",
    },
    mint: {
      term: "Mint",
      aka: ["Cashu", "ecash", "monnaie électronique"],
      said: "Le service Cashu qui détient les sats d'un séquestre sous forme d'ecash verrouillé aux trois clés.",
    },
    mint_rule: {
      term: "La règle des mints",
      aka: ["respecte la règle", "présélection"],
      said: "Ce qu'il faut à un mint pour que CommissionMarket le marque Respecte la règle : il annonce tous les NUT dont un séquestre a besoin (7, 8, 11, 12 et 20), il a été disponible 99 % ou plus des 30 derniers jours selon cashumints.space, et le Round Robin Auditor l'a vu payer sans échec depuis 3 mois ou plus. Si l'auditeur est injoignable, un mint reste admis, avec une mention. Un test de verrou réel échoué l'exclut.",
    },
    nut: {
      term: "NUT",
      aka: ["NUT Cashu", "Notation, Usage and Terminology"],
      said: "Un chapitre numéroté du protocole Cashu (Notation, Usage and Terminology). Chaque mint indique les NUT qu'il prend en charge. Un séquestre en demande cinq : le NUT 7 vérifie si l'ecash est dépensé, le NUT 8 rend les frais Lightning non utilisés d'un paiement, le NUT 11 verrouille les sats à des clés (le verrou 2 sur 3), le NUT 12 prouve que le mint a signé honnêtement, et le NUT 20 ne laisse que la clé qui l'a demandé émettre une facture payée.",
    },
    refund_after: {
      term: "Remboursement après",
      aka: ["jours de remboursement", "verrou temporel"],
      said: "Les jours après la date attendue à partir desquels le client seul peut reprendre un séquestre.",
    },
    sat: {
      term: "sat",
      aka: ["sats", "satoshi"],
      said: "La plus petite unité du bitcoin : 100 000 000 sats font un bitcoin. Chaque prix ici est en sats.",
    },
    bitcoin: {
      term: "Bitcoin",
      aka: ["BTC"],
      said: "Une monnaie à l'offre fixe qu'aucun gouvernement n'émet et qu'aucune banque ne contrôle.",
    },
    lightning: {
      term: "Lightning",
      aka: ["réseau Lightning"],
      said: "Un réseau de paiement construit sur Bitcoin pour des paiements rapides et petits. Les commandes sont payées par lui.",
    },
    invoice: {
      term: "Facture",
      aka: ["facture Lightning"],
      said: "Une demande Lightning de paiement d'un nombre exact de sats, avec une expiration.",
    },
    lightning_address: {
      term: "Adresse Lightning",
      aka: ["adresse de paiement"],
      said: "Une adresse comme nom@portefeuille.example qui établit une nouvelle facture pour chaque paiement.",
    },
    api_sats: {
      term: "api_sats",
      aka: ["frais d'outil", "crédit Tollbooth"],
      said: "Le crédit de ton portefeuille Tollbooth qui règle la petite redevance de chaque outil Task Booth. Il est distinct de ce que paie une commande.",
    },
    npub: {
      term: "npub",
      aka: ["clé publique", "Nostr"],
      said: "Ta clé Nostr publique : le nom par lequel tu es connu, invité et connecté.",
    },
    nsec: {
      term: "nsec",
      aka: ["clé secrète", "clé privée"],
      said: "Ta clé Nostr secrète. Elle signe en ton nom, elle reste donc entre tes mains.",
    },
    signature: {
      term: "Signature",
      aka: ["signer", "signé"],
      said: "La marque de ta clé Nostr sur un énoncé, qui prouve que tu as accepté exactement ces mots. Chaque signature est demandée et donnée par message privé.",
    },
    sha256: {
      term: "sha256",
      aka: ["hash", "empreinte", "condensé"],
      said: "L'empreinte d'un texte ou d'un fichier : tout changement le concernant change l'empreinte.",
    },
    reputation: {
      term: "Réputation",
      aka: ["dossier", "historique", "renommée"],
      said: "Ce qu'une npub a fait sur les commandes dans chaque rôle qu'elle a tenu : client, prestataire, arbitre et inspecteur. Tout le monde peut la lire.",
    },
    rank: {
      term: "Rang",
      aka: ["nouveau", "inégal", "confirmé", "fiable", "exemplaire"],
      said: "Un mot pour une réputation : nouveau, inégal, confirmé, fiable ou exemplaire, selon le nombre de commandes terminées et de celles qui se sont bien passées. L'Opérateur fixe où commence chaque rang.",
    },
    claim_of_cause: {
      term: "Motif invoqué",
      aka: ["motif", "excuse", "justification"],
      said: "Les raisons pour lesquelles le prestataire n'a jamais livré le travail, envoyées dans le délai de contestation. L'arbitre les accepte ou les rejette, et un défaut avec motif compte autrement.",
    },
    organization: {
      term: "Organisation",
      aka: ["org", "structure"],
      said: "Un groupe qui réunit des Projets. Ses membres y publient des commandes ; les prestataires invités à faire le travail forment le cercle de chaque Projet.",
    },
    member: {
      term: "Membre",
      aka: ["membres"],
      said: "Une personne que le propriétaire ajoute à une Organisation. Un membre voit chaque Projet et ses commandes, et peut y publier des commandes. Un membre est un pair du client, jamais un des prestataires invités.",
    },
    project: {
      term: "Projet",
      aka: ["chantier"],
      said: "Là où un ensemble de commandes est rangé, avec un budget et des conditions par défaut. Chaque nouvelle commande est rangée dans l'un d'eux.",
    },
    project_defaults: {
      term: "Conditions par défaut",
      aka: ["valeurs par défaut", "modèle"],
      said: "Les conditions avec lesquelles démarre une nouvelle commande d'un Projet. Ensuite, chaque commande garde ses propres conditions.",
    },
  },
};
