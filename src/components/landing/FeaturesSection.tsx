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
    title: 'Real-time tracking',
    description:
      'Track phone theft incidents in real-time with our advanced mapping system. See where and when thefts are occurring to identify patterns and hotspots.',
  },
  {
    icon: faUserShield,
    title: 'Community alerts',
    description:
      'Get notified when thefts occur in your area. Our community-driven alert system helps you stay informed about local incidents and potential risks.',
  },
  {
    icon: faShieldHalved,
    title: 'Data privacy',
    description:
      'Your data is secure with us. We use industry-standard encryption and privacy practices to ensure your personal information remains protected.',
  },
  {
    icon: faLock,
    title: 'Secure reporting',
    description:
      'Report theft incidents securely through our platform. Your reports help build a comprehensive database of phone thefts across London.',
  },
  {
    icon: faHeadset,
    title: 'Recovery support',
    description:
      'Get assistance in recovering your stolen phone. Our platform provides resources and guidance to help increase your chances of recovery.',
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
      <Title className={classes.title}>Advanced phone theft tracking for London</Title>

      <Container size={560} p={0}>
        <Text size="sm" className={classes.description}>
          Our platform combines cutting-edge technology with community-driven data to create the most comprehensive
          phone theft tracking system in London. Join thousands of Londoners protecting their phones.
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
