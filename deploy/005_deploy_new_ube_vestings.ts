import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { BigNumber, ethers } from 'ethers';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer, signerAccount } = await getNamedAccounts();

  console.log({ deployer, signerAccount });

  const ONE_WEEK = 7 * 24 * 60 * 60;
  const startDate = ~~(+new Date('2024-03-15T12:00:00Z') / 1000);
  const mining_reserve_multisig = '0xC4294309894279c5722681Ca2A47D4D3bcb7fA91';
  const ecosystem_multisig = '0xfa7692443CA45E7a8E6182586A46d6b69F2041aE';
  const team_multisig = '0x85Bbd0084F421fC99A1F75a32a480b42df7eFB41';
  const marketing_listing_multisig = '0x3CDB7098842621C22721F8C576d49dC366555167';
  const advisory_multisig = '0x698659428B197a83B80915788BCCe0040C329B12';
  const ubeAddress = (await hre.deployments.get('UbeToken')).address;
  console.log({ ubeAddress });

  const miningDuration = 3 * 52 * ONE_WEEK;
  await deployments.deploy('UbeMiningReserveVesting', {
    contract: 'UbeMiningReserveVesting',
    from: deployer,
    args: [
      ubeAddress, // address token,
      mining_reserve_multisig, // address beneficiaryAddress,
      startDate, // uint64 startTimestamp,
      miningDuration, // uint64 durationSeconds,
      ONE_WEEK, // uint64 intervalSeconds
    ],
    log: true,
    autoMine: true,
  });

  const ecosystemDuration = 3 * 52 * ONE_WEEK;
  await deployments.deploy('UbeEcosystemVesting', {
    contract: 'UbeEcosystemVesting',
    from: deployer,
    args: [
      ubeAddress, // address token,
      ecosystem_multisig, // address beneficiaryAddress,
      startDate, // uint64 startTimestamp,
      ecosystemDuration, // uint64 durationSeconds,
      ONE_WEEK, // uint64 intervalSeconds
    ],
    log: true,
    autoMine: true,
  });

  const teamDuration = 3 * 52 * ONE_WEEK;
  await deployments.deploy('UbeTeamVesting', {
    contract: 'UbeTeamVesting',
    from: deployer,
    args: [
      ubeAddress, // address token,
      team_multisig, // address beneficiaryAddress,
      startDate, // uint64 startTimestamp,
      teamDuration, // uint64 durationSeconds,
      ONE_WEEK, // uint64 intervalSeconds
    ],
    log: true,
    autoMine: true,
  });

  const ONE_MONTH = 30 * 24 * 60 * 60;
  const marketingDuration = 2 * ONE_MONTH;
  await deployments.deploy('UbeMarketingVesting', {
    contract: 'UbeMarketingVesting',
    from: deployer,
    args: [
      ubeAddress, // address token,
      marketing_listing_multisig, // address beneficiaryAddress,
      startDate, // uint64 startTimestamp,
      marketingDuration, // uint64 durationSeconds,
      ONE_MONTH, // uint64 intervalSeconds
    ],
    log: true,
    autoMine: true,
  });

  const advisoryDuration = 142 * ONE_WEEK;
  const advisoryStartDate = ~~(+new Date('2024-06-15T12:00:00Z') / 1000);
  await deployments.deploy('UbeAdvisoryVesting', {
    contract: 'UbeAdvisoryVesting',
    from: deployer,
    args: [
      ubeAddress, // address token,
      advisory_multisig, // address beneficiaryAddress,
      advisoryStartDate, // uint64 startTimestamp,
      advisoryDuration, // uint64 durationSeconds,
      ONE_WEEK, // uint64 intervalSeconds
    ],
    log: true,
    autoMine: true,
  });
};

export default func;
func.id = 'deploy_ube_vesting'; // id required to prevent reexecution
func.tags = ['UbeVesting'];
