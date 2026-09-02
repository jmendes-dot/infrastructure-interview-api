variable "cluster_name" {
  description = "Name of the local kind cluster."
  type        = string
  default     = "interview"
}

variable "kind_node_image" {
  description = "Pinned kind node image used by every cluster node."
  type        = string
  default     = "kindest/node:v1.34.0"
}

variable "api_host_port" {
  description = "Loopback port mapped to the API NodePort."
  type        = number
  default     = 8080
}
