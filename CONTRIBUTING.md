# Guia de Contribuição 🚀

Obrigado por considerar contribuir para o Pro Soccer Online! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## 📋 Código de Conduta

Esperamos que todos os contribuidores sigam um código de conduta respeitoso. Seja educado, inclusivo e profissional em todas as interações.

## 🎯 Como Contribuir

### Reportando Bugs

Antes de criar um novo relatório de bug:
- Verifique se o bug já não foi reportado
- Seja descritivo e claro
- Inclua exemplos específicos para demonstrar os passos
- Descreva o comportamento observado e o que você esperava
- Inclua screenshots se possível

**Formato de um bom relatório de bug:**
```
Descrição breve do bug
Passos para reproduzir
Comportamento esperado
Comportamento atual
Informações do sistema (OS, Node.js, navegador, etc.)
```

### Sugerindo Melhorias

As sugestões de melhorias são sempre bem-vindas! Inclua:
- Um título claro e descritivo
- Uma descrição detalhada da melhoria sugerida
- Exemplos de como a melhoria seria usada
- Possíveis benefícios
- Possíveis problemas ou limitações

### Pull Requests

1. **Faça um Fork** do repositório
2. **Crie uma branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Faça seus commits** com mensagens claras (`git commit -m 'Add some AmazingFeature'`)
4. **Faça push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request** com descrição detalhada

#### Checklist para Pull Requests

- [ ] Meu código segue as convenções de estilo deste projeto
- [ ] Atualizei a documentação necessária
- [ ] Adicionei testes para as novas funcionalidades
- [ ] Meus testes passam localmente
- [ ] Meu código não introduz novos warnings

## 🎨 Convenções de Código

### JavaScript/TypeScript

```typescript
// ✅ Bom
const getUserById = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// ❌ Ruim
async function getUserById(id) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
```

### Componentes React

```typescript
// ✅ Bom
interface UserCardProps {
  name: string
  email: string
  onDelete?: (id: string) => void
}

export const UserCard: React.FC<UserCardProps> = ({
  name,
  email,
  onDelete,
}) => {
  return (
    <div className="p-4 border rounded">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  )
}

// ❌ Ruim
export const UserCard = (props) => {
  return (
    <div className="p-4 border rounded">
      <h3>{props.name}</h3>
    </div>
  )
}
```

### Nomes de Branches

Use este padrão:
- `feature/nome-da-feature` - Nova funcionalidade
- `bugfix/nome-do-bug` - Correção de bug
- `docs/nome-da-doc` - Documentação
- `refactor/nome-do-refactor` - Refatoração
- `chore/nome-do-chore` - Tarefas administrativas

### Mensagens de Commit

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve login button not responding
docs: update installation guide
style: format code with prettier
refactor: simplify user validation
test: add unit tests for auth module
chore: update dependencies
```

## 📚 Setup de Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/oswaldopaim/prosocceronline.git

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
pnpm dev
```

## 🔍 Verificações de Qualidade

Antes de fazer push, execute:

```bash
# Lint
pnpm lint

# Corrigir linting automaticamente
pnpm lint:fix

# Verificar tipos
pnpm type-check

# Formatar código
pnpm format

# Build
pnpm build
```

## 📖 Documentação

- Documente as funções públicas com comentários JSDoc
- Mantenha o README atualizado
- Atualize CHANGELOG.md se necessário

Exemplo de JSDoc:

```typescript
/**
 * Busca um usuário pelo ID
 * @param id - O ID único do usuário
 * @returns Promise com os dados do usuário
 * @throws {Error} Se o usuário não for encontrado
 */
const getUserById = async (id: string): Promise<User> => {
  // ...
}
```

## 🧪 Testes

Quando adicionar uma funcionalidade:
- Escreva testes para a nova funcionalidade
- Certifique-se de que todos os testes passam
- Mantenha alta cobertura de testes

```bash
pnpm test
pnpm test:ui
```

## 📝 Licença

Ao contribuir para este projeto, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.

## 🤝 Comunidade

- GitHub Issues - Para bugs e sugestões
- GitHub Discussions - Para perguntas e discussões gerais
- Pull Requests - Para propostas de código

---

Obrigado por contribuir! 🎉
