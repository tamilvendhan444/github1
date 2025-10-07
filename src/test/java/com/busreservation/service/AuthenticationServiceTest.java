package com.busreservation.service;

import com.busreservation.dao.UserDAO;
import com.busreservation.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthenticationServiceTest {
    
    @Mock
    private UserDAO userDAO;
    
    private AuthenticationService authService;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authService = new AuthenticationService();
    }
    
    @Test
    void testRegisterUser_ValidInput_ShouldReturnTrue() {
        // Given
        String username = "testuser";
        String email = "test@example.com";
        String password = "password123";
        String fullName = "Test User";
        String phoneNumber = "1234567890";
        
        when(userDAO.getUserByUsername(username)).thenReturn(null);
        when(userDAO.getUserByEmail(email)).thenReturn(null);
        when(userDAO.createUser(any(User.class))).thenReturn(true);
        
        // When
        boolean result = authService.registerUser(username, email, password, fullName, phoneNumber);
        
        // Then
        assertTrue(result);
        verify(userDAO).createUser(any(User.class));
    }
    
    @Test
    void testRegisterUser_UsernameExists_ShouldReturnFalse() {
        // Given
        String username = "existinguser";
        String email = "test@example.com";
        String password = "password123";
        String fullName = "Test User";
        String phoneNumber = "1234567890";
        
        User existingUser = new User();
        when(userDAO.getUserByUsername(username)).thenReturn(existingUser);
        
        // When
        boolean result = authService.registerUser(username, email, password, fullName, phoneNumber);
        
        // Then
        assertFalse(result);
        verify(userDAO, never()).createUser(any(User.class));
    }
    
    @Test
    void testLoginUser_ValidCredentials_ShouldReturnTrue() {
        // Given
        String username = "testuser";
        String password = "password123";
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        
        when(userDAO.authenticateUser(username, password)).thenReturn(true);
        when(userDAO.getUserByUsername(username)).thenReturn(user);
        
        // When
        boolean result = authService.loginUser(username, password);
        
        // Then
        assertTrue(result);
        assertTrue(authService.isLoggedIn());
        assertEquals(user, authService.getCurrentUser());
    }
    
    @Test
    void testLoginUser_InvalidCredentials_ShouldReturnFalse() {
        // Given
        String username = "testuser";
        String password = "wrongpassword";
        
        when(userDAO.authenticateUser(username, password)).thenReturn(false);
        
        // When
        boolean result = authService.loginUser(username, password);
        
        // Then
        assertFalse(result);
        assertFalse(authService.isLoggedIn());
    }
    
    @Test
    void testLogoutUser_ShouldClearCurrentUser() {
        // Given
        User user = new User();
        authService.loginUser("testuser", "password123");
        
        // When
        authService.logoutUser();
        
        // Then
        assertFalse(authService.isLoggedIn());
        assertNull(authService.getCurrentUser());
    }
}