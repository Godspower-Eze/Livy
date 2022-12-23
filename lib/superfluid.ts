import { Framework } from "@superfluid-finance/sdk-core";

class Superfluid {
  async sf(chainId: number, provider: any) {
    const _sf = await Framework.create({
      chainId,
      provider,
    });
    return _sf;
  }

  signer(sf: Framework, provider: any) {
    const _signer = sf.createSigner({ provider });
    return _signer;
  }

  async getFlow(
    sf: Framework,
    tokenAddress: string,
    sender: string,
    receiver: string,
    provider: any
  ) {
    const flowInfo = await sf.cfaV1.getFlow({
      superToken: tokenAddress,
      sender: sender,
      receiver: receiver,
      providerOrSigner: provider,
    });
    return flowInfo;
  }

  async startFlow(
    sf: Framework,
    signer: any,
    tokenAddress: string,
    sender: string,
    receiver: string,
    flowRate: string
  ) {
    const createFlowOperation = sf.cfaV1.createFlow({
      sender,
      flowRate: flowRate,
      receiver,
      superToken: tokenAddress,
    });
    try {
      const result = await createFlowOperation.exec(signer);
      const receipt = await result.wait();
      return receipt.status == 1 ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async deleteFlow(
    sf: Framework,
    signer: any,
    tokenAddress: string,
    sender: string,
    receiver: string
  ) {
    const deleteFlowOperation = sf.cfaV1.deleteFlow({
      sender,
      receiver,
      superToken: tokenAddress,
    });
    try {
      const result = await deleteFlowOperation.exec(signer);
      const receipt = await result.wait();
      return receipt.status == 1 ? true : false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default Superfluid;
