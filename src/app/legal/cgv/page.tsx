import Link from "next/link";

export const metadata = {
  title: "Conditions Générales de Vente | Francilienne Energy",
  description: "Conditions générales de vente pour les professionnels",
};

export default function CGVPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Conditions Générales de Vente</h1>
          <p className="text-white/80 mt-2">Réservées aux professionnels</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8 space-y-8">

          {/* Article 1 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">1. Champ d&apos;application</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Les présentes conditions générales de vente (&laquo;&nbsp;CGV&nbsp;&raquo;) constituent, conformément à l&apos;article L. 441-6 du Code de commerce, le socle unique de la relation commerciale entre les parties. Elles ont pour objet de définir les conditions dans lesquelles la société SMSTIC (&laquo;&nbsp;Le Fournisseur&nbsp;&raquo;) fournit aux Acheteurs professionnels (&laquo;&nbsp;l&apos;Acheteur&nbsp;&raquo;) qui lui en font la demande, les produits qu&apos;il propose (&laquo;&nbsp;Les Produits&nbsp;&raquo;).
              </p>
              <p>
                Elles s&apos;appliquent sans restriction ni réserves à toutes les ventes conclues par le Fournisseur auprès des Acheteurs de même catégorie, quelles que soient les clauses pouvant figurer sur les documents de l&apos;Acheteur, et notamment ses conditions générales d&apos;achat.
              </p>
              <p>
                Conformément à la réglementation en vigueur, ces CGV sont systématiquement communiquées à tout Acheteur qui en fait la demande, pour lui permettre de passer commande auprès du Fournisseur. Elles sont également communiquées à tout distributeur préalablement à la conclusion d&apos;une convention unique visées à l&apos;article L. 441-7 du Code de commerce, dans les délais légaux.
              </p>
              <p>
                Toute commande de Produits implique, de la part de l&apos;Acheteur, l&apos;acceptation des présentes CGV.
              </p>
              <p>
                Les renseignements figurant sur les catalogues, prospectus et tarifs du Fournisseur sont donnés à titre indicatif et sont révisables à tout moment. Le Fournisseur est en droit d&apos;y apporter toutes modifications qui lui paraîtront utiles.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">2. Commandes - Tarifs</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                <strong>2.1</strong> Les ventes ne sont parfaites qu&apos;après confirmation expresse et par écrit de la commande de l&apos;Acheteur, par le Fournisseur, qui s&apos;assurera notamment, de la disponibilité des produits demandés.
              </p>
              <p>
                <strong>2.2</strong> Les Produits sont fournis aux tarifs du Fournisseur en vigueur au jour de la passation de la commande, et, le cas échéant, dans la proposition commerciale spécifique adressée à l&apos;Acquéreur. Ces tarifs sont fermes et non révisables pendant leur période de validité, telle qu&apos;indiquée le Fournisseur.
              </p>
              <p>
                Ces prix sont nets et HT, départ usine et emballage en sus. Ils ne comprennent pas le transport, ni les frais de douane éventuels et les assurances qui restent à la charge de l&apos;Acheteur.
              </p>
              <p>
                Des conditions tarifaires particulières peuvent être pratiquées en fonction des spécificités demandées par l&apos;Acheteur concernant, notamment, les modalités et délais de livraison, ou les délais et conditions de règlement. Une offre commerciale particulière sera alors adressée à l&apos;Acheteur par le Fournisseur.
              </p>
              <p>
                <strong>2.3</strong> Les commandes ne peuvent faire l&apos;objet d&apos;aucune annulation. Toute commande validée entraine la facturation totale des Produits commandés.
              </p>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">3. Conditions de paiement</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Le prix est payable en totalité lors de la passation de la commande et au plus tard, selon les stipulations indiquées sur la facture, dans un délai de 60 jours à compter de la date d&apos;émission de la facture.
              </p>
              <p>
                Aucun escompte ne sera pratiqué par le Fournisseur pour paiement dans un délai inférieur à celui mentionné aux présentes CGV.
              </p>
              <p>
                En cas de retard de paiement et de versement des sommes dues par l&apos;Acheteur au-delà du délai ci-dessus fixé, et après la date de paiement figurant sur la facture adressée à celui-ci, des pénalités de retard calculées au taux de 12 % du montant TTC du prix figurant sur ladite facture, seront automatiquement et de plein droit acquises au Fournisseur, sans formalité aucune ni mise en demeure préalable.
              </p>
              <p>
                En cas de non-respect des conditions de paiement figurant ci-dessus, le Fournisseur se réserve en outre le droit de suspendre ou d&apos;annuler la livraison des commandes en cours de la part de l&apos;Acheteur.
              </p>
              <p>
                Enfin, une indemnité forfaitaire pour frais de recouvrement, d&apos;un montant de 40 euros sera due, de plein droit et sans notification préalable par l&apos;Acheteur en cas de retard de paiement. Le Fournisseur se réserve le droit de demander à l&apos;Acheteur une indemnisation complémentaire si les frais de recouvrement effectivement engagés dépassaient ce montant, sur présentation des justificatifs.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">4. Livraisons</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Les Produits acquis par l&apos;Acheteur sont livrés dans un délai raisonnable à compter de la validation de la commande par le Fournisseur, dont la durée est précisée au moment de la commande. Les délais de livraison ne sont donnés qu&apos;à titre informatif et indicatif ; ceux-ci dépendant notamment de la disponibilité des transporteurs, de l&apos;ordre d&apos;arrivée des commandes et de la mise à disposition des Produits auprès du Fournisseur. Les retards de livraison ne peuvent donner lieu à aucune indemnité, ni motiver l&apos;annulation de la commande.
              </p>
              <p>La livraison sera effectuée :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>soit par la remise directe des Produits à un transporteur, les produits voyageant aux risques et périls de l&apos;Acheteur.</li>
                <li>soit par le retirement des Produits au sein de l&apos;entrepôt du Fournisseur dont l&apos;adresse est communiquée par ce dernier. Dans ce cas, l&apos;Acheteur dispose d&apos;un délai de trois (3) jours pour retirer les Produits à compter de l&apos;indication du Fournisseur selon laquelle les Produits sont disponibles. Les frais de retirement sont à la charge de l&apos;Acheteur. A défaut de retirement dans le délai imparti, le Fournisseur se réserve la possibilité de faire application des dispositions du Code civil selon lesquelles la résolution du contrat est de plein droit. De même, passé le délai fixé, le Fournisseur n&apos;est pas tenu d&apos;une obligation de conservation des Produits et n&apos;est donc pas responsable de leur éventuelle détérioration.</li>
              </ul>
              <p>
                L&apos;Acheteur est tenu de vérifier l&apos;état apparent des produits lors de la livraison. A défaut de réserves expressément émises par l&apos;Acheteur lors de la livraison, les Produits délivrés par le Fournisseur seront réputés conformes en quantité et qualité à la commande. L&apos;Acheteur disposera d&apos;un délai de deux (2) jours à compter de la livraison et de la réception des produits commandés pour émettre, par écrit, de telles réserves auprès du Fournisseur. Aucune réclamation ne pourra être valablement acceptée en cas de non-respect de ces formalités par l&apos;Acheteur.
              </p>
              <p>
                Le Fournisseur remplacera dans les plus brefs délais et à ses frais, les Produits livrés dont le défaut de conformité aura été dûment prouvé par l&apos;Acheteur.
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">5. Transfert de propriété - Transfert des risques</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                <strong>5.1 Réserve de propriété</strong><br />
                Le Fournisseur se réserve, jusqu&apos;au complet paiement du prix par l&apos;Acheteur, un droit de propriété sur les Produits vendus, lui permettant de reprendre possession desdits Produits. Tout acompte versé par l&apos;Acheteur restera acquis au Fournisseur à titre d&apos;indemnisation forfaitaire, sans préjudice de toutes autres actions qu&apos;il serait en droit d&apos;intenter de ce fait à l&apos;encontre de l&apos;Acheteur.
              </p>
              <p>
                <strong>5.2 Transfert de propriété</strong><br />
                Le transfert de propriété des Produits, au profit de l&apos;Acheteur, ne sera réalisé qu&apos;après complet paiement du prix par ce dernier, et ce quelle que soit la date de livraison desdits Produits.
              </p>
              <p>
                <strong>5.3 Transfert des risques</strong><br />
                Le transfert à l&apos;Acheteur des risques de perte et de détérioration des produits sera réalisé dès livraison desdits Produits (par remise au transporteur ou retiraison par l&apos;Acheteur), indépendamment du transfert de propriété, et ce quelle que soit la date de la commande et du paiement de celle-ci. L&apos;Acheteur s&apos;oblige, en conséquence, à faire assurer, à ses frais, les produits commandés, au profit du Fournisseur, par une assurance ad hoc, jusqu&apos;au complet transfert de propriété et à en justifier à ce dernier lors de la livraison. A défaut, le Fournisseur serait en droit de retarder la livraison jusqu&apos;à la présentation de ce justificatif.
              </p>
              <p>
                L&apos;Acheteur reconnaît que c&apos;est au transporteur qu&apos;il appartient d&apos;effectuer la livraison, le Fournisseur étant réputé avoir rempli son obligation de délivrance dès lors qu&apos;il a remis les produits commandés au transporteur qui les a acceptées sans réserve. L&apos;Acheteur ne dispose donc d&apos;aucun recours en garantie contre le Fournisseur en cas de défaut de livraison des Produits commandés ni des dommages survenus en cours de transport ou de déchargement.
              </p>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">6. Responsabilité du Fournisseur - Garantie</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Les produits livrés par le Fournisseur bénéficient d&apos;une garantie contractuelle d&apos;une durée d&apos;un (1) an, à compter de la date de livraison, couvrant la non-conformité des produits à la commande et tout vice caché, provenant d&apos;un défaut de conception ou de fabrication affectant les produits livrés et les rendant impropres à l&apos;utilisation. Cette garantie est limitée au remplacement ou au remboursement des produits non conformes ou affectés d&apos;un vice.
              </p>
              <p>
                Toute garantie est exclue en cas de mauvaise utilisation, négligence ou défaut d&apos;entretien de la part de l&apos;Acheteur, comme en cas d&apos;usure normale du Produit ou de force majeure. La garantie est également exclue dans l&apos;hypothèse où les Produits auraient été modifiés ou mal installés.
              </p>
              <p>
                Le Fournisseur ne pourra être tenu responsable des dommages matériels ou immatériels, consécutifs ou non, subis par l&apos;Acheteur. Afin de faire valoir ses droits, l&apos;Acheteur devra, sous peine de déchéance de toute action s&apos;y rapportant, informer le Fournisseur, par écrit, de l&apos;existence des vices dans un délai maximum de quinze (15) jours à compter de leur découverte. Le Fournisseur remplacera ou remboursera les Produits ou pièces sous garantie jugés défectueux.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">7. Propriété intellectuelle</h2>
            <p className="text-text-secondary">
              Le Fournisseur conserve l&apos;ensemble des droits de propriété industrielle et intellectuelle afférents aux Produits, photos et documentations techniques qui ne peuvent être communiqués ni exécutés sans son autorisation écrite.
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">8. Imprévision</h2>
            <p className="text-text-secondary">
              Les présentes CGV excluent expressément le régime légal de l&apos;imprévision prévu à l&apos;article 1195 du Code civil pour toutes les opérations de vente de Produits du Fournisseur à l&apos;Acheteur. Le Fournisseur et l&apos;Acheteur renoncent donc chacun à se prévaloir des dispositions de l&apos;article 1195 du Code civil et du régime de l&apos;imprévision qui y est prévu, s&apos;engageant à assumer ses obligations même si l&apos;équilibre contractuel se trouve bouleversé par des circonstances qui étaient imprévisibles lors de la conclusion de la vente, quand bien même leur exécution s&apos;avèrerait excessivement onéreuse et à en supporter toutes les conséquences économiques et financières.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">9. Exception d&apos;inexécution</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                Il est rappelé qu&apos;en application de l&apos;article 1219 du Code civil, chaque Partie pourra refuser d&apos;exécuter son obligation, alors même que celle-ci est exigible, si l&apos;autre Partie n&apos;exécute pas la sienne et si cette inexécution est suffisamment grave, c&apos;est-à-dire susceptible de remettre en cause la poursuite du contrat ou de bouleverser fondamentalement son équilibre économique.
              </p>
              <p>
                La suspension d&apos;exécution prendra effet immédiatement, à réception par la Partie défaillante de la notification de manquement qui lui aura été adressée à cet effet par la Partie victime de la défaillance indiquant l&apos;intention de faire application de l&apos;exception d&apos;inexécution tant que la Partie défaillante n&apos;aura pas remédié au manquement constaté, signifiée par lettre recommandée avec demande d&apos;avis de réception ou sur tout autre support durable écrit permettant de ménager une preuve de l&apos;envoi.
              </p>
              <p>
                Si l&apos;empêchement était définitif ou perdurait au-delà de deux (2) mois, les présentes seraient purement et simplement résolues selon les modalités définies à l&apos;article 11.1.
              </p>
            </div>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">10. Force majeure</h2>
            <p className="text-text-secondary">
              Les Parties ne pourront être tenus pour responsables si la non-exécution ou le retard dans l&apos;exécution de l&apos;une quelconque de leurs obligations, telles que décrites dans les présentes, découle d&apos;un cas de force majeure, au sens de l&apos;article 1218 du Code civil.
            </p>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">11. Résolution du contrat</h2>
            <div className="text-text-secondary space-y-3">
              <p>
                <strong>11.1 Résolution pour inexécution d&apos;une obligation suffisamment grave</strong><br />
                La Partie victime de la défaillance pourra, nonobstant la clause Résolution pour manquement d&apos;une partie à ses obligations figurant ci-après, en cas d&apos;inexécution suffisamment grave de l&apos;une quelconque des obligations incombant à l&apos;autre Partie, notifier par lettre recommandée avec demande d&apos;avis de réception à la Partie Défaillante, la résolution fautive des présentes, quinze (15) jours après la réception d&apos;une mise en demeure de s&apos;exécuter restée infructueuse, et ce en application des dispositions de l&apos;article 1224 du Code civil.
              </p>
              <p>
                <strong>11.2 Résolution pour force majeure</strong><br />
                Il est convenu expressément que les parties peuvent résoudre de plein droit le présent contrat, sans sommation, ni formalité.
              </p>
              <p>
                <strong>11.3 Résolution pour manquement d&apos;une partie à ses obligations</strong><br />
                En cas de non-respect par l&apos;une ou l&apos;autre des parties des obligations suivantes : paiement, retirement des Produits, respect des droits de propriété intellectuelle du Fournisseur, le contrat pourra être résolu au gré de la partie lésée. Il est expressément entendu que cette résolution pour manquement d&apos;une partie à ses obligations aura lieu de plein droit, la mise en demeure résultant du seul fait de l&apos;inexécution de l&apos;obligation, sans sommation, ni exécution de formalités.
              </p>
            </div>
          </section>

          {/* Article 12 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">12. Litiges</h2>
            <p className="text-text-secondary">
              Tous les litiges auxquels le présent contrat pourrait donner lieu, concernant tant sa validité, son interprétation, son exécution, sa résolution, leurs conséquences et leurs suites seront soumis au tribunal de PARIS.
            </p>
          </section>

          {/* Article 13 */}
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">13. Droit applicable</h2>
            <p className="text-text-secondary">
              De convention expresse entre les parties, les présentes CGV et les opérations d&apos;achat et de vente qui en découlent sont régies par le droit français. Elles sont rédigées en langue française. Dans le cas où elles seraient traduites en une ou plusieurs langues, seul le texte français ferait foi en cas de litige.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-text-secondary">
            Pour toute question sur ces CGV, contactez-nous à{" "}
            <a href="mailto:contact@francilienne-energy.fr" className="text-primary hover:underline">
              contact@francilienne-energy.fr
            </a>
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
