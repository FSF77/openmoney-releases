# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v1.0.26** (Build 36)
> *Publicada em: 24/10/2026 às 17:39*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-1.0.26.zip** | Pacote oficial v1.0.26 para macOS | [📥 Download v1.0.26](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-1.0.26.zip) | ~3 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
217db0638d61b1c606e0fcd2c812416311cec4a3e4f417f8bc3f1b8024ce2a0f  OpenMoney-1.0.26.zip
```

### 📝 Notas desta Versão
Melhorias no aviso de abatimento (Liquid Glass), ordenação cronológica estável no mesmo dia, proteção na inicialização para bases não encontradas, histórico de arquivos recentes no menu Arquivo e suporte a faturas de cartão no CSV

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-1.0.26.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-1.0.26.zip).
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
