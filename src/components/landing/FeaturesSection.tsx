import { Container, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGaugeHigh, 
  faUserShield, 
  faLock, 
  faShieldHalved, 
  faHeadset 
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import classes from './FeaturesSection.module.css';

export const MOCKDATA = [
  {
    icon: faGaugeHigh,
    title: 'Creating a tracking dataset',
    description:
      'We cant export location data directly from your device, but by plotting this manually we build up a comprehensive dataset of where stolen phones are moving.',
  },
  {
    icon: faUserShield,
    title: 'AI to spot storage locations',
    description:
      'When thousands of people in the community add their tracking routes, we integrate with AI to spot common locations where phones are being stored after being stolen.',
  },
  {
    icon: faShieldHalved,
    title: 'Supporting police and emergency services',
    description:
      'When you report your theft to the police theres no way for them to get this data - but now we can give police and emergency services specific areas to focus on.',
  },
  {
    icon: faLock,
    title: 'Secure reporting',
    description:
      'Report theft incidents securely through our platform, we use encryption at rest and in transit and take precautions to protect your tracking data.',
  },
  {
    icon: faHeadset,
    title: 'Free for everyone',
    description:
      'We built the platform out of frustration at how bad the problem is becoming: the anonymised tracking data and maps will remain free to everyone, forever.',
  },
];

interface FeatureProps {
  icon: IconDefinition;
  title: React.ReactNode;
  description: React.ReactNode;
}

export function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div>
      <ThemeIcon variant="light" size={40} radius={40} color="blue">
        <FontAwesomeIcon icon={icon} size="lg" />
      </ThemeIcon>
      <Text mt="sm" mb={7} fw={500}>
        {title}
      </Text>
      <Text size="sm" c="dimmed" lh={1.6}>
        {description}
      </Text>
    </div>
  );
}

export function FeaturesSection() {
  const features = MOCKDATA.map((feature, index) => <Feature {...feature} key={index} />);

  return (
    <Container size="xl" className={classes.wrapper}>
      <Title className={classes.title}>What does our platform to do help?</Title>

      <Container size={560} p={0}>
        <Text size="sm" className={classes.description}>
          We built snatchback.London as a forever free service to allow people to manually plot where their phone was snatched, the route that you saw it take,
          where it stopped and was obviously being stored, and where it eventually stopped tracking.
        </Text>
      </Container>

      <SimpleGrid
        mt={60}
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing={{ base: 'xl', md: 50 }}
        verticalSpacing={{ base: 'xl', md: 50 }}
      >
        {features}
      </SimpleGrid>
    </Container>
  );
}

export default FeaturesSection;
