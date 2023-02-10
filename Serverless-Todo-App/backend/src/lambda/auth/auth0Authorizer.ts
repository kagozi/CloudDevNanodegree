import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import Axios from 'axios';
import { JwtPayload } from '../../auth/JwtPayload';

const logger = createLogger('auth');
const jwksUrl = 'https://dev-2l5lrmmkji78x22r.us.auth0.com/.well-known/jwks.json';

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (error) {
    logger.error('User not authorized', { error: error.message });
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {
    const token = getToken(authHeader);
    const { data: { keys } } = await Axios.get(jwksUrl);
    const pemData = keys[0].x5c[0];
    const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`;
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
  } catch (err) {
    logger.error('Fail to authenticate', err);
    throw err;
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');
  if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header');
  return authHeader.split(' ')[1];
}
