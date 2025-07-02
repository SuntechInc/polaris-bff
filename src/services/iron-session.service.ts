import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sealData, unsealData } from 'iron-session';

export interface IronSessionData {
  token: string;
}

@Injectable()
export class IronSessionService {
  private readonly secret: string;
  private readonly ttl: number;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    // Usar a mesma chave secreta do frontend
    this.secret = this.configService.get<string>('IRON_SESSION_SECRET') || '12345678901234567890123456789012';
    this.ttl = 60 * 60 * 24 * 7; // 7 dias
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    console.log(`🔧 [IronSessionService] Secret configurado: ${this.secret.substring(0, 10)}...`);
    console.log(`🔧 [IronSessionService] Ambiente: ${this.isProduction ? 'production' : 'development'}`);
  }

  async decryptCookie(cookieValue: string): Promise<string | null> {
    try {
      console.log(`🔓 [IronSessionService] Tentando descriptografar cookie: ${cookieValue.substring(0, 20)}...`);
      
      // Usar unsealData com a mesma configuração do frontend
      const sessionData = await unsealData(cookieValue, {
        password: this.secret,
        ttl: this.ttl,
      }) as IronSessionData;

      console.log(`✅ [IronSessionService] Cookie descriptografado com sucesso`);
      console.log(`🔑 [IronSessionService] Token extraído: ${sessionData.token ? sessionData.token.substring(0, 20) + '...' : 'null'}`);
      
      return sessionData.token || null;
    } catch (error) {
      console.error('❌ [IronSessionService] Erro ao descriptografar cookie do iron-session:', error.message);
      console.error('❌ [IronSessionService] Stack trace:', error.stack);
      return null;
    }
  }

  isIronSessionCookie(cookieValue: string): boolean {
    // Verificar se o cookie tem o formato do iron-session (começa com Fe26.2)
    const isIronSession = cookieValue.startsWith('Fe26.2');
    console.log(`🔍 [IronSessionService] Verificando se é iron-session: ${isIronSession}`);
    return isIronSession;
  }

  // Método para testar a criptografia (útil para debug)
  async encryptToken(token: string): Promise<string> {
    try {
      const sessionData: IronSessionData = { token };
      const encrypted = await sealData(sessionData, {
        password: this.secret,
        ttl: this.ttl,
      });
      console.log(`🔒 [IronSessionService] Token criptografado: ${encrypted.substring(0, 20)}...`);
      return encrypted;
    } catch (error) {
      console.error('❌ [IronSessionService] Erro ao criptografar token:', error);
      throw error;
    }
  }
} 