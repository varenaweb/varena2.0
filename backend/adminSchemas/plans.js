const {
  textField,
  textareaField,
  createListFields,
  navItemFields,
  footerLinkFields,
  whatsappFields,
  metaFields,
} = require("./common");

const plansFields = [
  ...metaFields(),
  ...navItemFields(),

  textField("hero.kicker", "Hero – kicker"),
  textField("hero.title", "Hero – title"),
  textareaField("hero.description", "Hero – description")
];

for (let i = 0; i < 3; i += 1) {
  plansFields.push(
    textField(`plans.cards[${i}].label`, `Plans card ${i + 1} label`),
    textField(`plans.cards[${i}].title`, `Plans card ${i + 1} title`),
    textareaField(`plans.cards[${i}].main`, `Plans card ${i + 1} main text`),
    ...createListFields(`plans.cards[${i}].list`, `Plans card ${i + 1} list item`, 4, "textarea"),
    textareaField(`plans.cards[${i}].note`, `Plans card ${i + 1} note`),
    textField(`plans.cards[${i}].price.ars`, `Plans card ${i + 1} price (ARS)`),
    textField(`plans.cards[${i}].price.usd`, `Plans card ${i + 1} price (USD)`)
  );
}

plansFields.push(textareaField("plans.disclaimer", "Plans – disclaimer"));

plansFields.push(
  textField("payment.kicker", "Payment – kicker"),
  textField("payment.title", "Payment – title")
);

for (let i = 0; i < 2; i += 1) {
  plansFields.push(
    textField(`payment.cards[${i}].title`, `Payment card ${i + 1} title`),
    textareaField(`payment.cards[${i}].text`, `Payment card ${i + 1} description`),
    ...createListFields(
      `payment.cards[${i}].list`,
      `Payment card ${i + 1} list item`,
      2,
      "textarea"
    )
  );
}

plansFields.push(
  textField("payment.process.kicker", "Payment process – kicker"),
  textField("payment.process.title", "Payment process – title"),
  textareaField("payment.process.description", "Payment process – description"),
  textField("footer.tagline", "Footer – tagline"),
  ...footerLinkFields(),
  ...whatsappFields()
);

module.exports = plansFields;
