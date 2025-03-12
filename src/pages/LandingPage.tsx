import { Button, Container, Group, Text } from '@mantine/core';
import { IconSquareRoundedChevronsUpFilled } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import FaqSection from '../components/landing/FaqSection';
import classes from './LandingPage.module.css';

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleButtonClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <Container size="xl">
          <Group justify="space-between" align="center">
            <Group gap="xs" align="center">
              <IconSquareRoundedChevronsUpFilled 
                size={28} 
                style={{ color: "#1c94d8", stroke: "#1c94d8", fill: "#1c94d8" }}
              />
              <Text 
                className={classes.title} 
                c="black" 
                size="xl" 
                fw={900} 
                variant="gradient" 
                gradient={{ from: 'cyan', to: 'blue', deg: 72 }}
              >
                snatchback.London
              </Text>
            </Group>
            
            <Button 
              variant="gradient" 
              gradient={{ from: 'cyan', to: 'blue', deg: 72 }}
              onClick={handleButtonClick}
            >
              {user ? 'Go to home' : 'Login'}
            </Button>
          </Group>
        </Container>
      </header>

      <main>
        <HeroSection />
        <FeaturesSection />
        <FaqSection />
      </main>

      <footer className={classes.footer}>
        <Container size="xl">
          <div className={classes.footerContent}></div>
        </Container>
      </footer>
    </div>
  );
}

export default LandingPage;
