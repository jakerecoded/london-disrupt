import { Accordion, Container, Title } from '@mantine/core';
import classes from './FaqSection.module.css';

const faqItems = [
  {
    question: 'How does the phone theft tracking system work?',
    answer: 'Our platform uses user reports and map plots to track phone theft incidents across London. When a theft occurs, users can report the details including location, time, and phone information. This data is then mapped and analyzed to identify patterns and hotspots.'
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, we take data security very seriously. All data is encrypted and stored securely, and we dont take any of your data other than email address to log in. We never share your data with third parties, and we comply with all relevant data protection regulations.'
  },
  {
    question: 'How can I report a stolen phone?',
    answer: 'After creating an account, you can report a stolen phone by clicking the "Add Theft Location" button on the map interface. You\'ll be prompted to enter details about the theft, including location, time, and phone description. The more information you provide, the better. Remember to phone the police too on 111 to report your theft.'
  },
  {
    question: 'Can I add the route it took?',
    answer: 'Yes, you can plot the route your stolen phone took on the map - even identifying spots where it stayed still, was being stored, or stopped moving. You can even add multiple incidents.'
  },
  {
    question: 'Is this service free to use?',
    answer: 'The phone snatching situation in London is so frustrating, so we built this platform to give a better picture of where these phones are being taken to. The platform will be free forever.'
  },
  {
    question: 'Is this run by the Metropolitan Police?',
    answer: 'No, its entirely a community effort to crowdsource more detailed data and intelligence on where this is happening across the city, and where these gangs are operating from.'
  }
];

export function FaqSection() {
  return (
    <Container className={classes.wrapper}>
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
