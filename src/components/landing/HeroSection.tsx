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
              Track and{' '}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: 'cyan', to: 'blue', deg: 72 }}
              >
                recover
              </Text>{' '}
              stolen phones in London
            </Title>

            <Text className={classes.description} mt={30} c="white">
              Our platform helps you track phone theft incidents, analyze patterns, and increase
              the chances of recovering your stolen phone with advanced mapping and analytics tools
            </Text>

            <Button
              variant="gradient"
              gradient={{ from: 'cyan', to: 'blue', deg: 72 }}
              size="xl"
              className={classes.control}
              mt={40}
              onClick={handleGetStarted}
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
