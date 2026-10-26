# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.0.1** (Build 54)
> *Publicada em: 26/10/2026 às 19:51*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.0.1.zip** | Pacote oficial v2.0.1 para macOS | [📥 Download v2.0.1](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.0.1.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
2839f12774eb778b4f91b8cb92dbd65bf44e8d29bb6f7fe98491fd2d0c60da9b  OpenMoney-2.0.1.zip
```

### 📝 Notas desta Versão
Fatura de Cartão de Crédito identificada oficialmente pelo mês de vencimento (padrão de mercado), compatibilidade no seletor de mês, tags, exportação/importação CSV e migração transparente v7.

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.0.1.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.0.1.zip).
2. Dê dois cliques para descompactar o `OpenMoney.app`.
3. Arraste para a pasta **/Applications**.
4. **Se o macOS exibir o aviso:** *"OpenMoney está danificado e não pode ser aberto"*
   > Esse é o comportamento padrão do macOS Gatekeeper para aplicativos distribuídos fora da Mac App Store sem certificado corporativo anual da Apple.
   
   Para liberar, basta abrir o **Terminal** e executar:
   ```bash
   xattr -cr /Applications/OpenMoney.app
   ```
   *(Ou clique com o botão direito / Control-clique no aplicativo > **Abrir** > confirmar **Abrir**).*

5. A partir de então, todas as próximas atualizações serão instaladas diretamente pelo próprio aplicativo no menu **OpenMoney > Buscar Atualizações...**.
