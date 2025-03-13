import { Button, Container, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import classes from './HeroSection.module.css';

export function HeroSection() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className={classes.root}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              Track and help police{' '}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: 'cyan', to: 'blue', deg: 72 }}
              >
                recover
              </Text>{' '}
              stolen phones in London by plotting the route they took.
            </Title>

            <Text className={classes.description} mt={30} c="white">
              snatchback.London is a forever free platform to manually plot location data from your stolen device
              to crowdsource intelligence on where phones are being stolen, where they're moving to, and where they're
              being stored across London.
            </Text>

            <Text className={classes.title} mt={30} fw={700} c="white">With a detailed picture that we all create, we can put the Met on the front foot.</Text>

            <Button
              variant="gradient"
              gradient={{ from: 'cyan', to: 'blue', deg: 72 }}
              size="xl"
              className={classes.control}
              mt={40}
              onClick={handleGetStarted}
              style={{
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.transform = 'scale(1.05)';
                target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.transform = 'scale(1)';
                target.style.boxShadow = 'none';
              }}
            >
              Get started
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default HeroSection;
