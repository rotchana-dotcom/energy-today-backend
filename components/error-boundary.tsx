import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Clipboard } from 'react-native';
import { ScreenContainer } from './screen-container';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary
 * 
 * Catches all React errors and displays detailed error information
 * instead of crashing silently.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ERROR BOUNDARY CAUGHT:', error);
    console.error('🔴 ERROR INFO:', errorInfo);
    console.error('🔴 STACK TRACE:', error.stack);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  copyErrorToClipboard = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
ERROR: ${error?.name || 'Unknown'}
MESSAGE: ${error?.message || 'No message'}

STACK TRACE:
${error?.stack || 'No stack trace'}

COMPONENT STACK:
${errorInfo?.componentStack || 'No component stack'}
    `.trim();

    Clipboard.setString(errorText);
    alert('Error details copied to clipboard!');
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;

      return (
        <ScreenContainer className="p-6">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 gap-6">
              {/* Header */}
              <View className="gap-2 mt-4">
                <Text className="text-3xl font-bold text-error">
                  ⚠️ App Crashed
                </Text>
                <Text className="text-base text-muted">
                  The app encountered an error. Please share this information with the developer.
                </Text>
              </View>

              {/* Error Name */}
              <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Error Type:</Text>
                <View className="bg-surface border border-error rounded-lg p-4">
                  <Text className="text-error font-mono text-sm">
                    {error?.name || 'Unknown Error'}
                  </Text>
                </View>
              </View>

              {/* Error Message */}
              <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Error Message:</Text>
                <View className="bg-surface border border-error rounded-lg p-4">
                  <Text className="text-error font-mono text-sm">
                    {error?.message || 'No error message'}
                  </Text>
                </View>
              </View>

              {/* Stack Trace */}
              <View className="gap-2">
                <Text className="text-sm font-bold text-foreground">Stack Trace:</Text>
                <ScrollView 
                  className="bg-surface border border-border rounded-lg p-4 max-h-64"
                  nestedScrollEnabled
                >
                  <Text className="text-muted font-mono text-xs">
                    {error?.stack || 'No stack trace available'}
                  </Text>
                </ScrollView>
              </View>

              {/* Component Stack */}
              {errorInfo?.componentStack && (
                <View className="gap-2">
                  <Text className="text-sm font-bold text-foreground">Component Stack:</Text>
                  <ScrollView 
                    className="bg-surface border border-border rounded-lg p-4 max-h-64"
                    nestedScrollEnabled
                  >
                    <Text className="text-muted font-mono text-xs">
                      {errorInfo.componentStack}
                    </Text>
                  </ScrollView>
                </View>
              )}

              {/* Actions */}
              <View className="gap-3 mt-4">
                <TouchableOpacity
                  onPress={this.copyErrorToClipboard}
                  className="bg-primary px-6 py-4 rounded-lg active:opacity-80"
                >
                  <Text className="text-background font-semibold text-center">
                    📋 Copy Error Details
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null });
                  }}
                  className="bg-surface border border-border px-6 py-4 rounded-lg active:opacity-80"
                >
                  <Text className="text-foreground font-semibold text-center">
                    🔄 Try Again
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Instructions */}
              <View className="gap-2 mt-4">
                <Text className="text-xs text-muted text-center">
                  Tap "Copy Error Details" and send to the developer.
                </Text>
                <Text className="text-xs text-muted text-center">
                  You may need to restart the app after fixing the issue.
                </Text>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      );
    }

    return this.props.children;
  }
}
