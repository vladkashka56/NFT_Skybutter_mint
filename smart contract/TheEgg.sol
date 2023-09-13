// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../contract/ERC721AQueryable.sol";


interface IFood {
    function transferFrom(address holder, address POOL, uint256 amount) external;
}

contract Egg is ERC2981, ERC721AQueryable, Ownable {
    uint256 public numberOfAddressesWhitelisted;
    mapping(address => bool) whitelistedAddresses;
    IFood public immutable _food;
    address public constant POOL = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    using Address for address payable;
    using Strings for uint256;
    uint256 private _tokenIds;
    string public baseExtension = ".json";
    string aUri = "a";
    string bUri = "b";

    bytes32 public immutable _lotterySalt;
    uint32 public immutable _maxSupply;
    uint32 public immutable _teamSupply;
    uint32 public immutable _walletLimit;

    struct Status {
        // config
        uint32 maxSupply;
        uint32 publicSupply;
        uint32 walletLimit;
        uint256 price;

        // state
        uint32 publicMinted;
        uint32 userMinted;
        bool soldout;
        bool started;
    }

    uint32 public _teamMinted;
    uint256 public  _price;
    bool public _started;
    string public _metadataURI = "https://meta.the-swarm.xyz/swarmgas/json/";

    

    constructor(
        address food,
        uint32 maxSupply,
        uint32 teamSupply,
        uint32 walletLimit
    ) ERC721A("EGG1", "E1") {
        _food = IFood(food);
        require(maxSupply >= teamSupply);
        _lotterySalt = keccak256(abi.encodePacked(address(this), block.timestamp));
        _maxSupply = maxSupply;
        _teamSupply = teamSupply;
        _walletLimit = walletLimit;

        setFeeNumerator(750);
    }

    function addUserAddressToWhitelist(address _addressToWhitelist)
        public
        onlyOwner
    {
        require(
            !whitelistedAddresses[_addressToWhitelist],
            "Error: Sender already been whitelisted"
        );
        whitelistedAddresses[_addressToWhitelist] = true;
        numberOfAddressesWhitelisted += 1;
    }    

    function isWhitelisted(address _whitelistedAddress)
        public
        view
        returns (bool)
    {
        return whitelistedAddresses[_whitelistedAddress];
    }

    function removeUserAddressFromWhitelist(address _addressToRemove)
        public
        onlyOwner
    {
        require(
            whitelistedAddresses[_addressToRemove],
            "Error: Sender is not whitelisted"
        );

        whitelistedAddresses[_addressToRemove] = false;
        numberOfAddressesWhitelisted -= 1;
    }

    function getNumberOfWhitelistedAddresses() public view returns (uint256) {
        return numberOfAddressesWhitelisted;
    }    

    function Eggclaim(uint32 amount) external payable {
        uint32 publicMinted = _publicMinted();
        uint32 publicSupply = _publicSupply();

        require(_started, "not start");
        require(amount + publicMinted <= _publicSupply(), "No more");
        require(isWhitelisted(msg.sender), "error");        
        
        _safeMint(msg.sender, amount);
    }    

    function _publicMinted() public view returns (uint32) {
        return uint32(_totalMinted()) - _teamMinted;
    }

    function _publicSupply() public view returns (uint32) {
        return _maxSupply - _teamSupply;
    }

    function _status(address minter) external view returns (Status memory) {
        uint32 publicSupply = _maxSupply - _teamSupply;
        uint32 publicMinted = uint32(ERC721A._totalMinted()) - _teamMinted;

        return Status({
            // config
            price: _price,
            maxSupply: _maxSupply,
            publicSupply:publicSupply,
            walletLimit: _walletLimit,

            // state
            publicMinted: publicMinted,
            soldout:  publicMinted >= publicSupply,
            userMinted: uint32(_numberMinted(minter)),
            started: _started
        });
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC2981, ERC721A) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function devMint(address to, uint32 amount) external onlyOwner {
        _teamMinted += amount;
        require(_teamMinted <= _teamSupply, "Out of supply");
        _safeMint(to, amount);
    }

    function setFeeNumerator(uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(owner(), feeNumerator);
    }

    function setStarted(bool started) external onlyOwner {
        _started = started;
    }

    function setMetadataURI(string memory uri) external onlyOwner {
        _metadataURI = uri;
    }

    function setPrice(uint256 amount) external onlyOwner {
        _price = amount;
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).sendValue(address(this).balance);
    }

    function Feed(uint256 tokenId) external payable {
        require(tx.origin == msg.sender, "You dont own");
        _food.transferFrom(msg.sender, POOL, 5000000000);
        //status(tokenId);
        tokenURI(tokenId);
    }

    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require( _exists(tokenId), "ERC721Metadata: URI query for nonexistent token" );

        string memory baseURI = _metadataURI;
        
        //testing with logic
        if (block.timestamp % 2 == 0) {
            return bytes(aUri).length > 0
            ? string(abi.encodePacked(baseURI, aUri, tokenId.toString(), baseExtension))
            : "";
        }

        return bytes(bUri).length > 0
            ? string(abi.encodePacked(baseURI, bUri, tokenId.toString(), baseExtension))
            : "";

    }

    
    

}
