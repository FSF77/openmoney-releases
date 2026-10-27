# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.0.2** (Build 55)
> *Publicada em: 27/10/2026 às 08:27*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.0.2.zip** | Pacote oficial v2.0.2 para macOS | [📥 Download v2.0.2](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.0.2.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
d65a571ff2052de1e1d4f92654f0f1d10761968e00ad43c0ac1117b2f0df3721  OpenMoney-2.0.2.zip
```

### 📝 Notas desta Versão
Otimização no grid de lançamentos e no extrato em PDF: remoção da coluna redundante de data com aproveitamento do espaço nas descrições/categorias, barra de agrupamento com saldo real/previsto no fechamento de cada dia e melhor espaçamento visual.

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.0.2.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.0.2.zip).
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
