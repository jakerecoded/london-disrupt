import { Accordion, Container, Title } from '@mantine/core';
import classes from './FaqSection.module.css';

const faqItems = [
  {
    question: 'How does the phone theft tracking system work?',
    answer: 'Our platform uses real-time data and user reports to track phone theft incidents across London. When a theft occurs, users can report the details including location, time, and phone information. This data is then mapped and analyzed to identify patterns and hotspots.'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent, and we comply with all relevant data protection regulations.'
  },
  {
    question: 'How can I report a stolen phone?',
    answer: 'After creating an account, you can report a stolen phone by clicking the "Add Theft Location" button on the map interface. You\'ll be prompted to enter details about the theft, including location, time, and phone description. The more information you provide, the better.'
  },
  {
    question: 'Can I track my phone if it was stolen?',
    answer: 'Yes, our platform allows you to track the route your phone took after the theft if location services were enabled. This can provide valuable information about where your phone might have been taken and potentially help in recovery efforts.'
  },
  {
    question: 'Is this service free to use?',
    answer: 'We offer both free and premium tiers. The basic tracking and reporting features are free for all users. Premium features, including advanced analytics and priority alerts, are available with a subscription.'
  }
];

export function FaqSection() {
  return (
    <Container size="xl" className={classes.wrapper}>
      <Title ta="center" className={classes.title}>
        Frequently Asked Questions
      </Title>

      <Accordion variant="separated">
        {faqItems.map((item, index) => (
          <Accordion.Item className={classes.item} value={`question-${index}`} key={index}>
            <Accordion.Control>{item.question}</Accordion.Control>
            <Accordion.Panel>{item.answer}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}

export default FaqSection;
