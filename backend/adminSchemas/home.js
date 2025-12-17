const {
  textField,
  textareaField,
  createListFields,
  navItemFields,
  footerLinkFields,
  whatsappFields,
  metaFields,
} = require("./common");

const homeFields = [
  ...metaFields(),
  ...navItemFields(),

  textField("hero.kicker", "Hero – kicker"),
  textareaField("hero.subtitle", "Hero – subtitle"),
  textField("hero.buttons.primary", "Hero – primary button label"),
  textField("hero.buttons.secondary", "Hero – secondary button label"),
  textareaField("hero.note", "Hero – note"),
  ...createListFields("hero.list", "Hero – list item", 4, "textarea"),
  ...createListFields("hero.badges", "Hero – badge", 3, "text"),

  textField("services.kicker", "Services – kicker"),
  textField("services.title", "Services – title"),
  textareaField("services.description", "Services – description"),
];

for (let i = 0; i < 3; i += 1) {
  homeFields.push(
    textField(`services.cards[${i}].title`, `Services – card ${i + 1} title`),
    textareaField(`services.cards[${i}].text`, `Services – card ${i + 1} description`),
    ...createListFields(`services.cards[${i}].list`, `Services – card ${i + 1} list item`, 3, "textarea")
  );
}

homeFields.push(
  textField("services.common.kicker", "Services – common kicker"),
  textField("services.common.title", "Services – common title"),
  textareaField("services.common.description", "Services – common description")
);

for (let i = 0; i < 3; i += 1) {
  homeFields.push(
    textField(`services.common.cards[${i}].title`, `Services – common card ${i + 1} title`),
    ...createListFields(
      `services.common.cards[${i}].list`,
      `Services – common card ${i + 1} list item`,
      3,
      "textarea"
    )
  );
}

homeFields.push(
  textField("plans.kicker", "Plans – kicker"),
  textField("plans.title", "Plans – title"),
  textareaField("plans.description", "Plans – description")
);

for (let i = 0; i < 3; i += 1) {
  homeFields.push(
    textField(`plans.cards[${i}].label`, `Plans – card ${i + 1} label`),
    textField(`plans.cards[${i}].title`, `Plans – card ${i + 1} title`),
    textareaField(`plans.cards[${i}].main`, `Plans – card ${i + 1} main text`),
    ...createListFields(`plans.cards[${i}].list`, `Plans – card ${i + 1} list item`, 4, "textarea"),
    textareaField(`plans.cards[${i}].note`, `Plans – card ${i + 1} note`)
  );
}

homeFields.push(textareaField("plans.disclaimer", "Plans – disclaimer"));

homeFields.push(
  textField("payment.kicker", "Payment – kicker"),
  textField("payment.title", "Payment – title"),
  textareaField("payment.description", "Payment – description")
);

for (let i = 0; i < 2; i += 1) {
  homeFields.push(
    textField(`payment.cards[${i}].title`, `Payment – card ${i + 1} title`),
    textareaField(`payment.cards[${i}].text`, `Payment – card ${i + 1} description`),
    ...createListFields(
      `payment.cards[${i}].list`,
      `Payment – card ${i + 1} list item`,
      2,
      "textarea"
    )
  );
}

homeFields.push(
  textField("payment.process.kicker", "Payment process – kicker"),
  textField("payment.process.title", "Payment process – title"),
  textareaField("payment.process.description", "Payment process – description"),

  textField("process.kicker", "Process – kicker"),
  textField("process.title", "Process – title"),
  textareaField("process.description", "Process – description")
);

for (let i = 0; i < 4; i += 1) {
  homeFields.push(
    textField(`process.steps[${i}].title`, `Process step ${i + 1} title`),
    textareaField(`process.steps[${i}].text`, `Process step ${i + 1} text`)
  );
}

homeFields.push(
  textField("faq.kicker", "FAQ – kicker"),
  textField("faq.title", "FAQ – title")
);

for (let i = 0; i < 5; i += 1) {
  homeFields.push(
    textField(`faq.items[${i}].question`, `FAQ #${i + 1} – question`),
    textareaField(`faq.items[${i}].answer`, `FAQ #${i + 1} – answer`)
  );
}

homeFields.push(
  textField("about.kicker", "About – kicker"),
  textField("about.title", "About – title"),
  textareaField("about.paragraphs[0]", "About – paragraph 1"),
  textareaField("about.paragraphs[1]", "About – paragraph 2"),
  textField("about.aside.name", "About – aside name"),
  textField("about.aside.tagline", "About – aside tagline"),
  textareaField("about.aside.note", "About – aside note")
);

homeFields.push(
  textField("contact.kicker", "Contact section – kicker"),
  textField("contact.title", "Contact section – title"),
  textareaField("contact.description", "Contact section – description"),
  textField("contact.promptsTitle", "Contact section – prompts title"),
  textareaField("contact.hint", "Contact section – hint")
);

homeFields.push(...createListFields("contact.promptsList", "Contact section – prompt", 4, "textarea"));

homeFields.push(
  textField("contact.formNameLabel", "Contact section form – name label"),
  textField("contact.formNamePlaceholder", "Contact section form – name placeholder"),
  textField("contact.formEmailLabel", "Contact section form – email label"),
  textField("contact.formProjectLabel", "Contact section form – project label"),
  textField("contact.formProjectSelect", "Contact section form – project select label"),
  textField("contact.projectOptions.landing", "Contact section project option – landing"),
  textField("contact.projectOptions.web_full", "Contact section project option – web_full"),
  textField("contact.projectOptions.ecommerce", "Contact section project option – ecommerce"),
  textField("contact.projectOptions.other", "Contact section project option – other"),
  textField("contact.formContextLabel", "Contact section form – context label"),
  textField("contact.formContextPlaceholder", "Contact section form – context placeholder"),
  textField("contact.formMessageLabel", "Contact section form – message label"),
  textField("contact.formMessagePlaceholder", "Contact section form – message placeholder"),
  textField("contact.formSubmitLabel", "Contact section form – submit label")
);

homeFields.push(textField("footer.tagline", "Footer – tagline"));
homeFields.push(...footerLinkFields());
homeFields.push(...whatsappFields());

module.exports = homeFields;
