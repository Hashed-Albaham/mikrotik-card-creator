export interface MikrotikSettings {
  userType: string;
  mikrotikVersion: string;
  customer: string;
  hotspotServer: string;
  profile: string;
  hotspotLimit: string;
  hotspotDataLimit: string;
  comment: string;
  location: string;
}

export interface CredentialSettings {
  credentialType: string;
  credentialMatch: string;
  codeLength: number;
  accountCount: number;
  prefix: string;
  suffix: string;
  passSuffix: string;
  scriptDelay: number;
}

export interface GeneratedCredential {
  username: string;
  password: string;
  profile: string;
  comment: string;
  location: string;
}

const CHAR_SETS = {
  numbers: '0123456789',
  letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  mixed: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
};

export function generateRandomString(type: string, length: number): string {
  const chars = CHAR_SETS[type as keyof typeof CHAR_SETS] || CHAR_SETS.mixed;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateCredentials(
  mikrotik: MikrotikSettings,
  credential: CredentialSettings,
  useSerialNumber: boolean,
  serialStartNumber: number
): { credentials: GeneratedCredential[]; script: string } {
  const credentials: GeneratedCredential[] = [];
  let script = '';
  const usedUsernames = new Set<string>();

  for (let i = 0; i < credential.accountCount; i++) {
    // Generate unique username
    let username: string;
    do {
      const randomPart = generateRandomString(
        credential.credentialType,
        credential.codeLength
      );
      username = credential.prefix + randomPart + credential.suffix;
    } while (usedUsernames.has(username));
    usedUsernames.add(username);

    // Generate password based on match setting
    let password = '';
    if (credential.credentialMatch === 'same') {
      const usernamePart = username.substring(
        credential.prefix.length,
        username.length - credential.suffix.length
      );
      password = credential.prefix + usernamePart + credential.passSuffix;
    } else if (credential.credentialMatch === 'different') {
      password =
        generateRandomString(credential.credentialType, credential.codeLength) +
        credential.passSuffix;
    }
    // If 'empty', password stays empty string

    // Determine location/serial
    const location = useSerialNumber
      ? (serialStartNumber + i).toString()
      : mikrotik.location;

    credentials.push({
      username,
      password,
      profile: mikrotik.profile,
      comment: mikrotik.comment,
      location,
    });

    // Generate script based on user type and version
    if (mikrotik.userType === 'usermanager') {
      const customer = mikrotik.customer || 'admin';
      
      if (mikrotik.mikrotikVersion === 'v6') {
        // RouterOS v6 User Manager syntax
        script += `/tool user-manager user add customer="${customer}" username="${username}" password="${password}" comment="${mikrotik.comment}" location="${location}";\n`;
        script += `/tool user-manager user create-and-activate-profile customer="${customer}" profile=${mikrotik.profile} numbers=[find username="${username}"];\n`;
      } else {
        // RouterOS v7 User Manager syntax
        script += `/user-manager user add name="${username}" password="${password}" comment="${mikrotik.comment}";\n`;
        script += `/user-manager user-profile add profile="${mikrotik.profile}" user="${username}";\n`;
      }
    } else {
      // Hotspot syntax
      const comment = mikrotik.comment;
      const finalComment = location
        ? comment
          ? `${comment} | SN: ${location}`
          : `SN: ${location}`
        : comment;

      script += `/ip hotspot user add name="${username}" password="${password}" server="${mikrotik.hotspotServer || 'all'}" profile="${mikrotik.profile}"`;
      
      if (mikrotik.hotspotLimit.trim()) {
        script += ` limit-uptime="${mikrotik.hotspotLimit.trim()}"`;
      }
      
      if (mikrotik.hotspotDataLimit.trim()) {
        script += ` limit-bytes-total="${mikrotik.hotspotDataLimit.trim()}"`;
      }
      
      if (finalComment) {
        script += ` comment="${finalComment}"`;
      }
      
      script += ';\n';
    }

    // Add delay every 100 cards
    if (
      credential.scriptDelay > 0 &&
      (i + 1) % 100 === 0 &&
      i < credential.accountCount - 1
    ) {
      script += `/delay ${credential.scriptDelay}ms;\n`;
    }
  }

  return { credentials, script };
}
