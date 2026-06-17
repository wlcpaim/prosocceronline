import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para o Pro Soccer Online</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>⚽ Pro Soccer Online</Text>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Você foi convidado</Heading>
          <Text style={text}>
            Você recebeu um convite para entrar no{' '}
            <Link href={siteUrl} style={linkInline}>
              <strong>Pro Soccer Online</strong>
            </Link>
            . Clique no botão abaixo para aceitar e criar sua conta.
          </Text>
          <Section style={btnWrap}>
            <Button style={button} href={confirmationUrl}>
              Aceitar convite
            </Button>
          </Section>
          <Text style={small}>Ou copie e cole este link no navegador:</Text>
          <Link href={confirmationUrl} style={linkUrl}>
            {confirmationUrl}
          </Link>
          <Text style={footer}>
            Se você não esperava este convite, ignore este e-mail com segurança.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
const card = { backgroundColor: '#0d1320', borderRadius: '16px', padding: '32px 28px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#c4ccd6', lineHeight: '1.6', margin: '0 0 24px' }
const linkInline = { color: '#19d35e', textDecoration: 'none' }
const btnWrap = { textAlign: 'center' as const, margin: '0 0 24px' }
const button = {
  backgroundColor: '#19d35e',
  color: '#06210f',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const small = { fontSize: '12px', color: '#8a93a0', margin: '0 0 6px' }
const linkUrl = { fontSize: '12px', color: '#19d35e', wordBreak: 'break-all' as const }
const footer = {
  fontSize: '12px',
  color: '#6b7480',
  margin: '28px 0 0',
  borderTop: '1px solid #1d2735',
  paddingTop: '16px',
}
