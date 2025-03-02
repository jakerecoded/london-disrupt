import { useState, useRef, useEffect } from 'react';
import { IconChevronDown, IconLogout, IconEdit } from '@tabler/icons-react';
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
import { useDisclosure } from '@mantine/hooks';
import AuthDialog from './AuthDialog';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import classes from './Header.module.css';

const tabs = ['Home', 'Analytics'];

function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
  };

  const items = tabs.map((tab) => (
    <Tabs.Tab value={tab} key={tab} color="white">
      {tab}
    </Tabs.Tab>
  ));

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="xl">
        <Group justify="space-between">
          <Text className={classes.title} c="black" size="xl" fw={900} variant="gradient" gradient={{ from: 'cyan', to: 'blue', deg: 72 }}>snatchback.London</Text>

          <IncidentTitle />

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
          defaultValue="Home"
          variant="outline"
          visibleFrom="sm"
          classNames={{
            root: classes.tabs,
            list: classes.tabsList,
            tab: classes.tab,
          }}
        >
          <Tabs.List>{items}</Tabs.List>
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
  const [incidentTitle, setIncidentTitle] = useState<string>("Untitled Incident 1");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(incidentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

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
  const handleSave = () => {
    // Validate: only letters, numbers, and spaces, max 50 chars
    const validatedTitle = inputValue.trim();
    if (validatedTitle && /^[A-Za-z0-9 ]{1,50}$/.test(validatedTitle)) {
      setIncidentTitle(validatedTitle);
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

  return (
    <div className={classes.incidentTitleContainer}>
      {isEditing ? (
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
        <div className={classes.incidentTitleDisplay} onClick={handleStartEdit}>
          <Text size="xl" fw={400} c="white">
            {incidentTitle}
          </Text>
          <IconEdit size={16} className={classes.editIcon} />
        </div>
      )}
    </div>
  );
}

export default Header;
