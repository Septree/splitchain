export const ABI = [
  "function createGroup(string memory _name, address[] memory _members) public",
  "function addExpense(uint _groupId, string memory _description, uint _amount) public",
  "function settleDebt(uint _groupId, address _to) public payable",
  "function getMembers(uint _groupId) public view returns (address[] memory)",
  "function getExpenseCount(uint _groupId) public view returns (uint)",
  "function getExpense(uint _groupId, uint _index) public view returns (address, string memory, uint, uint)",
  "function getBalance(uint _groupId, address _member) public view returns (int)",
  "function groupCount() public view returns (uint)",
  "function groups(uint) public view returns (string memory name, bool exists)"
];