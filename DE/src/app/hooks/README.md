# PaperEngine/PaperDE Hooks Documentation

This directory contains React hooks that serve as integration points for connecting PaperDE to your custom OS distribution.

## Overview

The hooks in `usePaperDE.ts` provide abstractions for common OS-level operations. Currently, they contain mock implementations, but you can replace them with actual system calls for your distribution.

## Available Hooks

### `usePowerManagement()`

Provides power management functions for the desktop environment.

**Functions:**
- `suspend()` - Suspend the system (TODO: integrate with `systemctl suspend`)
- `shutdown()` - Shutdown the system (TODO: integrate with `systemctl poweroff`)
- `reboot()` - Reboot the system (TODO: integrate with `systemctl reboot`)
- `logout()` - Log out current user (TODO: integrate with session manager)

**Example:**
```tsx
const { suspend, shutdown, logout } = usePowerManagement();

// Called when user clicks shutdown
await shutdown();
```

### `useFileSystem()`

File system operations for the file manager.

**Functions:**
- `readDirectory(path)` - Read directory contents
- `createFile(path, content)` - Create a new file
- `deleteFile(path)` - Delete a file
- `moveFile(from, to)` - Move/rename a file

**Example:**
```tsx
const { readDirectory } = useFileSystem();
const files = await readDirectory('/home/paper/Documents');
```

### `useSystemMonitor()`

Real-time system statistics monitoring.

**Returns:**
- `cpuUsage` - Current CPU usage percentage
- `memoryUsage` - Current memory usage percentage
- `diskUsage` - Current disk usage percentage

**Example:**
```tsx
const { cpuUsage, memoryUsage } = useSystemMonitor();
// Values update automatically every 2 seconds
```

**TODO:** Integrate with `/proc/stat`, `/proc/meminfo`, etc.

### `useAuthentication()`

User authentication for the login screen.

**Functions:**
- `authenticate(username, password)` - Authenticate user credentials

**Example:**
```tsx
const { authenticate } = useAuthentication();
const success = await authenticate('Paper', 'Paper');
```

**TODO:** Integrate with PAM (Pluggable Authentication Modules)

### `useNetworkManager()`

Network management for Wi-Fi and connections.

**State:**
- `networks` - Array of available networks

**Functions:**
- `scanNetworks()` - Scan for available Wi-Fi networks
- `connectToNetwork(ssid, password)` - Connect to a network

**Example:**
```tsx
const { networks, scanNetworks, connectToNetwork } = useNetworkManager();
await scanNetworks();
await connectToNetwork('MyNetwork', 'password123');
```

**TODO:** Integrate with NetworkManager D-Bus interface

## Integration Guide

### For Linux Distributions

1. **Power Management:**
   ```tsx
   const shutdown = async () => {
     await exec('systemctl poweroff');
   };
   ```

2. **File System:**
   ```tsx
   const readDirectory = async (path: string) => {
     const { stdout } = await exec(`ls -la "${path}"`);
     // Parse and return file list
   };
   ```

3. **System Monitor:**
   ```tsx
   // Read from /proc/stat for CPU
   const cpuData = fs.readFileSync('/proc/stat', 'utf8');
   
   // Read from /proc/meminfo for memory
   const memData = fs.readFileSync('/proc/meminfo', 'utf8');
   ```

4. **Authentication:**
   ```tsx
   // Use node-pam or similar
   const authenticate = async (user: string, pass: string) => {
     return await pam.authenticate(user, pass);
   };
   ```

5. **Network Manager:**
   ```tsx
   // Use D-Bus to communicate with NetworkManager
   const bus = dbus.systemBus();
   const nm = bus.getInterface('org.freedesktop.NetworkManager', ...);
   ```

### For Custom OS Distributions

Replace the mock implementations with calls to your OS's native APIs. The hooks are designed to be drop-in replacements - just maintain the same function signatures and return types.

## Development

When adding new system integrations:

1. Add the integration to the appropriate hook in `usePaperDE.ts`
2. Update this README with usage examples
3. Test thoroughly with your OS distribution
4. Consider error handling and permission requirements

## Security Considerations

- Always validate user input before executing system commands
- Use proper authentication and authorization
- Avoid running commands with elevated privileges when possible
- Sanitize file paths to prevent directory traversal attacks
- Never expose sensitive system information in error messages

## License

Part of PaperEngine/PaperDE - use according to your project's license.
