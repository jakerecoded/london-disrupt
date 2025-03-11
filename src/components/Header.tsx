import { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconLogout, IconEdit, IconSquareRoundedChevronsUpFilled } from '@tabler/icons-react';
import { useIncident } from '../contexts/IncidentContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Burger,
  Container,
  Group,
  Menu,
  Tabs,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import AuthDialog from './AuthDialog';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { getIncidentTitle, updateIncidentTitle, loadUserIncidents } from '../services/theftService';
import { TheftIncident } from '../types/theft';
import classes from './Header.module.css';

const tabs = ['Home', 'Analytics'];

interface HeaderProps {
  onLogout?: () => void;
}

function Header({ onLogout }: HeaderProps = {}) {
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const handleTabChange = (value: string | null) => {
    if (value === 'Home') {
      navigate('/');
    } else if (value === 'Analytics') {
      navigate('/analytics');
    }
  };

  // Determine the active tab based on the current location
  const activeTab = location.pathname === "/" || location.pathname === "" 
    ? "Home" 
    : location.pathname.includes("analytics") 
      ? "Analytics" 
      : "Home";

  // Hide header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="xl">
        <Group justify="space-between">
          <Group gap="xs" align="center">
            <IconSquareRoundedChevronsUpFilled 
              size={28} 
              style={{ color: "#1c94d8", stroke: "#1c94d8", fill: "#1c94d8" }}
            />
            <Text className={classes.title} c="black" size="xl" fw={900} variant="gradient" gradient={{ from: 'cyan', to: 'blue', deg: 72 }}>snatchback.London</Text>
          </Group>

          {activeTab !== "Analytics" && <IncidentTitle />}

          <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />

          {user ? (
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              styles={{ dropdown: { background: "#283746", border: "#1c94d8" } }}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={`${classes.user} ${userMenuOpened ? classes.userActive : ''}`}
                >
                  <Group gap={7} styles={{ root: { padding: 8 } }}>
                    <Avatar 
                      src={null} 
                      alt={user.email || ''} 
                      radius="xl" 
                      size={20}
                    >
                      {user.email?.[0].toUpperCase()}
                    </Avatar>
                    <Text fw={500} size="sm" lh={1} mr={3} c="white">
                      {user.email}
                    </Text>
                    <IconChevronDown size={12} stroke={1.5} color="white" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} stroke={1.5} />}
                  onClick={handleSignOut}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <UnstyledButton
              onClick={() => setShowAuthDialog(true)}
              className={classes.user}
            >
              <Text size="sm" c="white" styles={{ root: { padding: 8 } }}>Sign in</Text>
            </UnstyledButton>
          )}
        </Group>
      </Container>
      <Container size="xl">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="outline"
          visibleFrom="sm"
          classNames={{
            root: classes.tabs,
            list: classes.tabsList,
            tab: classes.tab,
          }}
        >
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Tab value={tab} key={tab} color="white">
                {tab}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </Container>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </div>
  );
}

// Editable Incident Title Component
function IncidentTitle() {
  const { currentIncidentId, setCurrentIncidentId } = useIncident();
  const [incidentTitle, setIncidentTitle] = useState<string>("Untitled Incident");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(incidentTitle);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpened, setDropdownOpened] = useState<boolean>(false);
  const [userIncidents, setUserIncidents] = useState<TheftIncident[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Fetch the incident title when the incident ID changes
  useEffect(() => {
    if (!currentIncidentId) return;
    
    const fetchIncidentTitle = async () => {
      try {
        setIsLoading(true);
        const title = await getIncidentTitle(currentIncidentId);
        setIncidentTitle(title);
        setInputValue(title);
      } catch (error) {
        console.error('Error fetching incident title:', error);
        setError('Failed to load title');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIncidentTitle();
  }, [currentIncidentId]);

  // Fetch all user incidents
  useEffect(() => {
    const fetchUserIncidents = async () => {
      try {
        const incidents = await loadUserIncidents();
        setUserIncidents(incidents);
      } catch (error) {
        console.error('Error fetching user incidents:', error);
      }
    };
    
    fetchUserIncidents();
  }, []);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle starting edit mode
  const handleStartEdit = () => {
    setInputValue(incidentTitle);
    setIsEditing(true);
  };

  // Handle saving the title
  const handleSave = async () => {
    // Validate: only letters, numbers, and spaces, max 50 chars
    const validatedTitle = inputValue.trim();
    if (validatedTitle && /^[A-Za-z0-9 ]{1,50}$/.test(validatedTitle)) {
      try {
        setIsLoading(true);
        setError(null);
        
        if (currentIncidentId) {
          await updateIncidentTitle(currentIncidentId, validatedTitle);
        }
        
        setIncidentTitle(validatedTitle);
      } catch (error) {
        console.error('Error updating incident title:', error);
        setError('Failed to update title');
        // If there's an error, revert to the previous title
        setInputValue(incidentTitle);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If invalid, revert to previous title
      setInputValue(incidentTitle);
    }
    setIsEditing(false);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters, numbers, and spaces
    const value = e.target.value.replace(/[^A-Za-z0-9 ]/g, '');
    // Limit to 50 characters
    setInputValue(value.slice(0, 50));
  };

  // Handle key press events (Enter to save, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(incidentTitle);
    }
  };

  // Handle incident selection
  const handleIncidentSelect = (incidentId: string) => {
    if (incidentId !== currentIncidentId) {
      setCurrentIncidentId(incidentId);
      
      // Add notification for incident switch
      notifications.show({
        title: 'Incident Switched',
        message: 'Successfully switched to different incident',
        color: 'blue',
        autoClose: 3000,
      });
    }
    setDropdownOpened(false);
  };

  return (
    <div className={classes.incidentTitleContainer}>
      {isLoading ? (
        <Text size="xl" fw={400} c="white">Loading...</Text>
      ) : isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={classes.incidentTitleInput}
          maxLength={50}
        />
      ) : (
        <div className={classes.incidentTitleWrapper}>
          <div className={classes.incidentTitleDisplay} onClick={handleStartEdit}>
            <IconEdit size={16} className={classes.editIcon} />
            <Text size="xl" fw={400} c="white">
              {incidentTitle}
            </Text>
          </div>
          <Menu
            width={300}
            position="bottom"
            transitionProps={{ transition: 'pop-top-right' }}
            onClose={() => setDropdownOpened(false)}
            onOpen={() => setDropdownOpened(true)}
            opened={dropdownOpened}
            styles={{ 
              dropdown: { 
                background: "linear-gradient(90deg, rgba(22,35,46,1) 0%, rgba(21,26,29,1) 100%)", 
                border: "1px solid #1c94d8" 
              },
              item: { 
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(40, 55, 70, 0.1)' }
              }
            }}
            withinPortal
          >
            <Menu.Target>
              <div 
                className={`${classes.incidentDropdownIcon} ${dropdownOpened ? classes.incidentDropdownIconActive : ''}`}
              >
                <IconChevronDown size={16} stroke={1.5} color="white" />
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              {userIncidents.map((incident) => (
                <Menu.Item
                  key={incident.id}
                  onClick={() => handleIncidentSelect(incident.id!)}
                >
                  <Text 
                    size="xl" 
                    fw={incident.id === currentIncidentId ? 700 : 400} 
                    c="#1c94d8"
                  >
                    {incident.incident_title}
                  </Text>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
      )}
      {error && (
        <Text size="xs" c="red" style={{ position: 'absolute', bottom: '-20px', width: '100%', textAlign: 'center' }}>
          {error}
        </Text>
      )}
    </div>
  );
}

export default Header;
