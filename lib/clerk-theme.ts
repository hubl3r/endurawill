// Endurawill Clerk Appearance Theme
// Add this to your Clerk components to match your brand

export const endurawillTheme = {
  elements: {
    // Main container
    card: "shadow-2xl rounded-2xl border border-gray-200",
    
    // Header
    headerTitle: "text-2xl font-bold text-gray-900",
    headerSubtitle: "text-gray-600",
    
    // Logo
    logoBox: "h-12 mb-6",
    logoImage: "h-full w-auto",
    
    // Form elements
    formFieldInput: "rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    formFieldLabel: "text-sm font-medium text-gray-700",
    
    // Buttons
    formButtonPrimary: 
      "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-6 transition-colors",
    
    // Footer
    footer: "hidden", // Hide "Secured by Clerk" footer
    footerActionText: "text-gray-600 text-sm",
    footerActionLink: "text-blue-600 hover:text-blue-700 font-semibold",
    
    // Social buttons (Google, etc.)
    socialButtonsBlockButton: 
      "border-2 border-gray-300 hover:border-blue-500 rounded-lg py-3",
    socialButtonsBlockButtonText: "font-medium text-gray-700",
    
    // Divider
    dividerLine: "bg-gray-200",
    dividerText: "text-gray-500 text-sm",
    
    // Links
    identityPreviewText: "text-gray-700",
    identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
    
    // Alerts/Errors
    alert: "rounded-lg",
    alertText: "text-sm",
    
    // Cards
    cardBox: "rounded-2xl",
    
    // Navigation
    navbarButton: "text-gray-600 hover:text-blue-600",
  },
  
  variables: {
    colorPrimary: "#2563eb", // Endurawill blue
    colorDanger: "#dc2626",
    colorSuccess: "#16a34a",
    colorWarning: "#ea580c",
    colorTextOnPrimaryBackground: "#ffffff",
    colorTextSecondary: "#6b7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#1f2937",
    
    // Border radius
    borderRadius: "0.5rem",
    
    // Fonts
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyButtons: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    
    // Font sizes
    fontSize: "1rem",
    fontSizeButtons: "1rem",
  },
  
  layout: {
    socialButtonsPlacement: "bottom", // Google button at bottom
    socialButtonsVariant: "blockButton", // Full width buttons
    shimmer: true, // Loading animation
  }
};
