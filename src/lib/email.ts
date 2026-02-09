import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "Francilienne Energy <noreply@synexium.vercel.app>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "contact@francilienne-energy.fr";

/** Guard : si pas de clé API Resend configurée, on skip silencieusement */
function isEmailEnabled() {
  const key = process.env.RESEND_API_KEY;
  return !!key && key !== "re_PLACEHOLDER_configure_on_vercel";
}

/**
 * Email envoyé au client après inscription (PENDING)
 */
export async function sendRegistrationEmail(to: string, firstName: string) {
  if (!isEmailEnabled()) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Inscription reçue – Francilienne Energy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Bonjour ${firstName},</h2>
          <p>Nous avons bien reçu votre demande de création de compte professionnel.</p>
          <p>Notre équipe va examiner votre dossier dans les <strong>24 à 48h ouvrées</strong>.</p>
          <p>Vous recevrez un email dès que votre compte sera activé.</p>
          <br />
          <p style="color: #666;">L'équipe Francilienne Energy</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi email inscription:", error);
  }
}

/**
 * Email envoyé à l'admin quand un nouveau client s'inscrit
 */
export async function sendNewClientNotification(company: string, email: string, siret: string) {
  if (!isEmailEnabled()) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nouveau client en attente – ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Nouveau client à valider</h2>
          <p><strong>Société :</strong> ${company}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>SIRET :</strong> ${siret}</p>
          <br />
          <a href="https://synexium.vercel.app/admin/clients" 
             style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Voir dans l'admin
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi notification admin:", error);
  }
}

/**
 * Email envoyé au client quand son compte est ACTIVÉ
 */
export async function sendAccountApprovedEmail(to: string, firstName: string) {
  if (!isEmailEnabled()) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Compte activé – Francilienne Energy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Bienvenue ${firstName} !</h2>
          <p>Votre compte professionnel a été <strong style="color: #22c55e;">validé</strong> par notre équipe.</p>
          <p>Vous pouvez désormais :</p>
          <ul>
            <li>Consulter vos prix personnalisés</li>
            <li>Passer commande en ligne</li>
            <li>Suivre vos commandes</li>
          </ul>
          <br />
          <a href="https://synexium.vercel.app/auth/login" 
             style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Se connecter
          </a>
          <br /><br />
          <p style="color: #666;">L'équipe Francilienne Energy</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi email validation:", error);
  }
}

/**
 * Email envoyé au client quand son compte est REFUSÉ
 */
export async function sendAccountRejectedEmail(to: string, firstName: string, reason?: string) {
  if (!isEmailEnabled()) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Demande de compte – Francilienne Energy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Bonjour ${firstName},</h2>
          <p>Après examen de votre dossier, nous ne sommes pas en mesure de valider votre compte pour le moment.</p>
          ${reason ? `<p><strong>Motif :</strong> ${reason}</p>` : ""}
          <p>Si vous pensez qu'il s'agit d'une erreur, contactez-nous à <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
          <br />
          <p style="color: #666;">L'équipe Francilienne Energy</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi email refus:", error);
  }
}

/**
 * Email de confirmation de commande envoyé au client
 */
export async function sendOrderConfirmationEmail(
  to: string,
  firstName: string,
  orderReference: string,
  totalTTC: number,
  items: Array<{ designation: string; quantity: number; unitPriceHT: number }>,
  deliveryMethod: string,
  pickupLocation?: string | null
) {
  if (!isEmailEnabled()) return;
  try {
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.designation}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPriceHT.toFixed(2)} €</td>
          </tr>`
      )
      .join("");

    const deliveryText =
      deliveryMethod === "PICKUP"
        ? `Retrait en magasin – ${pickupLocation || ""}`
        : "Livraison à votre adresse";

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Commande ${orderReference} confirmée – Francilienne Energy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Merci ${firstName} !</h2>
          <p>Votre commande <strong>${orderReference}</strong> a bien été enregistrée.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Produit</th>
                <th style="padding: 8px; text-align: center;">Qté</th>
                <th style="padding: 8px; text-align: right;">Prix HT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <p style="font-size: 18px; font-weight: bold; text-align: right;">
            Total TTC : ${totalTTC.toFixed(2)} €
          </p>

          <p><strong>Mode :</strong> ${deliveryText}</p>

          <br />
          <a href="https://synexium.vercel.app/compte/commandes" 
             style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Suivre ma commande
          </a>
          <br /><br />
          <p style="color: #666;">L'équipe Francilienne Energy</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi email commande:", error);
  }
}

/**
 * Email envoyé à l'admin quand une nouvelle commande est passée
 */
export async function sendNewOrderNotification(
  company: string,
  orderReference: string,
  totalTTC: number
) {
  if (!isEmailEnabled()) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nouvelle commande ${orderReference} – ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">Nouvelle commande</h2>
          <p><strong>Client :</strong> ${company}</p>
          <p><strong>Référence :</strong> ${orderReference}</p>
          <p><strong>Total TTC :</strong> ${totalTTC.toFixed(2)} €</p>
          <br />
          <a href="https://synexium.vercel.app/admin/commandes" 
             style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Voir la commande
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur envoi notification commande:", error);
  }
}
