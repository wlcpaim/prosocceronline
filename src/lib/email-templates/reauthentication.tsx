import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação do Pro Soccer Online</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>⚽ Pro Soccer Online</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Confirme sua identidade</Heading>
          <Text style={text}>Use o código abaixo para confirmar sua identidade:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={footer}>
            Este código expira em breve. Se você não solicitou, ignore este
            e-mail com segurança.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Manrope, Arial, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }
const header = { padding: '8px 0 20px', textAlign: 'center' as const }
const brand = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#0d1320',
  margin: '0',
  letterSpacing: '-0.02em',
}
const card = { backgroundColor: '#0d1320', borderRadius: '16px', padding: '32px 28px', textAlign: 'center' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#c4ccd6', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  letterSpacing: '0.3em',
  color: '#19d35e',
  margin: '0 0 24px',
}
const footer = {
  fontSize: '12px',
  color: '#6b7480',
  margin: '20px 0 0',
  borderTop: '1px solid #1d2735',
  paddingTop: '16px',
}
